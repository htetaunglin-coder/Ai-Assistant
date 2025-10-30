import "server-only"
import { deleteCookie, getCookie, setCookie } from "@/utils/cookies/server"
import { ChatSDKError, getTypeByStatusCode } from "../error"
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
    throw new ChatSDKError(`${type}:auth`, errorData.error || "Invalid credentials.")
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
    throw new ChatSDKError(`${type}:auth`, errorData.error || "Failed to register user.")
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
  if (!token) throw new ChatSDKError("unauthorized:auth", "No refresh token available.")

  const response = await fetch(`${process.env.EXTERNAL_API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: token }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }))
    const type = getTypeByStatusCode(response.status)
    throw new ChatSDKError(`${type}:auth`, errorData.error || "Failed to refresh token.")
  }

  const data = await response.json()
  const newAccessToken = data.access_token

  if (!newAccessToken) {
    throw new ChatSDKError("internal_server_error:auth", "No access token found in refresh response.")
  }

  return newAccessToken
}

/* -------------------------------------------------------------------------- */

async function validateToken(accessToken?: string): Promise<User | false> {
  try {
    if (accessToken) {
      const response = await fetch(`${process.env.EXTERNAL_API_URL}/auth/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }))
        const type = getTypeByStatusCode(response.status)
        throw new ChatSDKError(`${type}:auth`, errorData.error || "Failed to validate access token.")
      }

      return response.json() || false
    } else {
      // TODO: Update the url to /auth/validate when backend is ready
      const response = await fetchWithAuth<User>(`${process.env.EXTERNAL_API_URL}/auth/me`)
      return response || false
    }
  } catch (err) {
    if (err instanceof ChatSDKError) throw err
    throw new ChatSDKError("internal_server_error:auth", (err as Error).message)
  }
}
/* -------------------------------------------------------------------------- */

async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await fetchWithAuth<User>(`${process.env.EXTERNAL_API_URL}/auth/me`)
    return user || null
  } catch (err) {
    if (err instanceof ChatSDKError) throw err
    throw new ChatSDKError("internal_server_error:auth", (err as Error).message)
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
      const cause = refreshError instanceof Error ? refreshError.message : String(refreshError)
      throw new ChatSDKError("unauthorized:auth", `Server token refresh failed: ${cause}`)
    }
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => `request failed with status ${response.status}`)
    const errorType = getTypeByStatusCode(response.status)
    throw new ChatSDKError(`${errorType}:api`, errorText)
  }

  return parseResponseFn<T>(response, parseResponse)
}

export const authServerAPI = { fetchWithAuth, getCurrentUser, login, logout, refreshToken, register, validateToken }
