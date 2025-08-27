"use server"

import { deleteCookie, getCookie, setCookie } from "@/utils/cookies/server"
import { logger } from "@/utils/logger"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "."
import { LoginFormValues, RegisterFormValues, User } from "./schema"

async function login(values: LoginFormValues) {
  const response = await fetch(`${process.env.EXTERNAL_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(errorData.message || "Invalid credentials.")
  }

  logger.debug("Login successful")

  const { accessToken, refreshToken } = await response.json()

  await setCookie(ACCESS_TOKEN, accessToken)
  await setCookie(REFRESH_TOKEN, refreshToken)
}

/* -------------------------------------------------------------------------- */

async function register(values: RegisterFormValues) {
  const response = await fetch(`${process.env.EXTERNAL_API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(errorData.message || "Invalid credentials.")
  }

  logger.debug("Registration successful")

  const { accessToken, refreshToken } = await response.json()

  await setCookie(ACCESS_TOKEN, accessToken)
  await setCookie(REFRESH_TOKEN, refreshToken)
}

/* -------------------------------------------------------------------------- */

async function logout() {
  logger.debug("Logout Successful")

  await deleteCookie(ACCESS_TOKEN)
  await deleteCookie(REFRESH_TOKEN)
}

/* -------------------------------------------------------------------------- */

async function refreshToken(refreshToken?: string): Promise<string> {
  logger.debug("Refreshing access token")

  const token = refreshToken || (await getCookie(REFRESH_TOKEN))

  if (!token) throw new Error("No refresh token available")

  const response = await fetch(`${process.env.EXTERNAL_API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    logger.warn({ message: "Access token refresh failed", status: response.status })
    const errorData = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(errorData.message || "Failed to refresh token")
  }

  const data = await response.json()
  const newAccessToken = data.accessToken

  if (!newAccessToken) {
    logger.error("Access token refresh response missing access token")
    throw new Error("New access token not found in refresh response.")
  }

  logger.debug("Access token Refreshed Successfully.")

  return newAccessToken
}

/* -------------------------------------------------------------------------- */

async function validateToken(accessToken?: string): Promise<User | false> {
  logger.debug("Validating access token")

  if (accessToken) {
    logger.debug("Validating provided access token")

    const response = await fetch(`${process.env.EXTERNAL_API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      logger.warn({ message: "Token validation failed", status: response.status })
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(errorData.message || "Failed to fetch user")
    }

    logger.debug("Access token validation successful")
    return response.json() || false
  } else {
    logger.debug("Validating token using fetchWithAuth")

    // TODO: Update the url to /auth/validate when the backend api is ready
    const response = await fetchWithAuth<User>(`${process.env.EXTERNAL_API_URL}/auth/me`)

    if (response) {
      logger.debug("Token validation successful via fetchWithAuth")
    } else {
      logger.warn("Token validation failed via fetchWithAuth")
    }

    return response || false
  }
}
/* -------------------------------------------------------------------------- */

async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await fetchWithAuth<User>(`${process.env.EXTERNAL_API_URL}/auth/me`)
    return user || null
  } catch (e) {
    console.error(e)
    return null
  }
}

/* -------------------------------------------------------------------------- */

type FetchWithAuthOptions = {
  method?: string
  body?: BodyInit | null
  headers?: HeadersInit
  credentials?: RequestCredentials
  parseResponse?: "json" | "text" | "blob" | "none"
}

async function fetchWithAuth<T = unknown>(input: RequestInfo | URL, init: FetchWithAuthOptions = {}): Promise<T> {
  const { parseResponse = "json", headers = {}, ...options } = init

  const requestHeaders = new Headers(headers)

  const accessToken = await getCookie(ACCESS_TOKEN)

  if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`)
  }

  const response = await fetch(input, {
    ...options,
    headers: requestHeaders,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }

  try {
    switch (parseResponse) {
      case "json":
        return (await response.json()) as T
      case "text":
        return (await response.text()) as T
      case "blob":
        return (await response.blob()) as T
      case "none":
        return undefined as T
      default:
        return (await response.json()) as T
    }
  } catch (parseError) {
    throw new Error(`Failed to parse response as ${parseResponse}: ${parseError}`)
  }
}

export { fetchWithAuth, getCurrentUser, login, logout, refreshToken, register, validateToken }
