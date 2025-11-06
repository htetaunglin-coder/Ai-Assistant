import "server-only"
import { cache } from "react"
import { deleteCookie, getCookie, setCookie } from "@/utils/cookies/server"
import { ApplicationError, getTypeByStatusCode } from "../error"
import { ParseResponseOptions, parseResponse as parseResponseFn } from "../parse-response"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./cookies"
import { LoginFormValues, RegisterFormValues, User } from "./schema"

async function login(values: LoginFormValues) {
  const response = await fetch(`${process.env.EXTERNAL_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }))
    const type = getTypeByStatusCode(response.status)
    throw new ApplicationError(type, "Failed to login. Please check your credentials.", errorData.error)
  }

  const { access_token, refresh_token } = await response.json()

  await setCookie(ACCESS_TOKEN, access_token)
  await setCookie(REFRESH_TOKEN, refresh_token)
}

/* -------------------------------------------------------------------------- */

async function register(values: RegisterFormValues) {
  const response = await fetch(`${process.env.EXTERNAL_API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }))
    const type = getTypeByStatusCode(response.status)
    throw new ApplicationError(type, "Failed to register. Please try again.", errorData.error)
  }

  const { access_token, refresh_token } = await response.json()

  await setCookie(ACCESS_TOKEN, access_token)
  await setCookie(REFRESH_TOKEN, refresh_token)
}

/* -------------------------------------------------------------------------- */

async function logout() {
  await deleteCookie(ACCESS_TOKEN)
  await deleteCookie(REFRESH_TOKEN)
}

/* -------------------------------------------------------------------------- */

async function refreshToken(refreshToken?: string): Promise<string> {
  const token = refreshToken || (await getCookie(REFRESH_TOKEN))

  if (!token) {
    throw new ApplicationError("unauthorized", "Session expired. Please sign in again.")
  }

  const response = await fetch(`${process.env.EXTERNAL_API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: token }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }))
    const type = getTypeByStatusCode(response.status)
    throw new ApplicationError(type, "Session expired. Please sign in again.", errorData.error)
  }

  const data = await response.json()
  const newAccessToken = data.access_token

  if (!newAccessToken) {
    throw new ApplicationError(
      "internal_server_error",
      "Authentication failed. Please sign in again.",
      "No access token in refresh response",
    )
  }

  return newAccessToken
}

/* -------------------------------------------------------------------------- */

async function validateToken(accessToken?: string): Promise<boolean> {
  try {
    if (accessToken) {
      const response = await fetch(`${process.env.EXTERNAL_API_URL}/auth/validate`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }))
        const type = getTypeByStatusCode(response.status)
        throw new ApplicationError(type, "Failed to validate session. Please sign in again.", errorData.error)
      }

      return response.json() || false
    } else {
      const response = await fetchWithAuth<boolean>(`${process.env.EXTERNAL_API_URL}/auth/validate`)
      return response || false
    }
  } catch (err) {
    if (err instanceof ApplicationError) throw err

    const cause = err instanceof Error ? err.message : String(err)
    throw new ApplicationError("internal_server_error", "Failed to validate session. Please try again.", cause)
  }
}

/**
 * Cached version of token validation used in server components.
 *
 * Prevents repeated validation requests within the same render lifecycle.
 */
const validateTokenCached = cache(async (): Promise<boolean> => {
  return validateToken()
})

/* -------------------------------------------------------------------------- */

async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await fetchWithAuth<User>(`${process.env.EXTERNAL_API_URL}/auth/me`)
    return user || null
  } catch (err) {
    if (err instanceof ApplicationError) throw err

    const cause = err instanceof Error ? err.message : String(err)
    throw new ApplicationError("internal_server_error", "Failed to get user information. Please try again.", cause)
  }
}

/* -------------------------------------------------------------------------- */

type FetchWithAuthOptions = {
  method?: string
  body?: BodyInit | null
  headers?: HeadersInit
  credentials?: RequestCredentials
  parseResponse?: ParseResponseOptions
}

async function fetchWithAuth<T = unknown>(input: RequestInfo | URL, init: FetchWithAuthOptions = {}): Promise<T> {
  const { parseResponse = "json", headers = {}, ...options } = init

  const requestHeaders = new Headers(headers)

  const accessToken = await getCookie(ACCESS_TOKEN)

  if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`)
  }

  let response = await fetch(input, {
    ...options,
    headers: requestHeaders,
  })

  if (response.status === 401) {
    try {
      const newAccessToken = await refreshToken()
      await setCookie(ACCESS_TOKEN, newAccessToken)
      requestHeaders.set("Authorization", `Bearer ${newAccessToken}`)

      response = await fetch(input, {
        ...options,
        headers: requestHeaders,
      })
    } catch (refreshError) {
      await logout()

      if (refreshError instanceof ApplicationError) throw refreshError

      const cause = refreshError instanceof Error ? refreshError.message : String(refreshError)
      throw new ApplicationError("unauthorized", "Session expired. Please sign in again.", cause)
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }))
    const errorType = getTypeByStatusCode(response.status)

    throw new ApplicationError(
      errorType,
      `Request failed with status ${response.status}. Please try again.`,
      `caues:${errorData.error}, HTTP ${response.status}: ${response.statusText}`,
    )
  }

  return parseResponseFn<T>(response, parseResponse)
}

export const authServerAPI = {
  fetchWithAuth,
  getCurrentUser,
  login,
  logout,
  refreshToken,
  register,
  validateToken,
  validateTokenCached,
}
