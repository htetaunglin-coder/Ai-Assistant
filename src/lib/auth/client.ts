"use client"

async function refreshToken(): Promise<void> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Token refresh failed: ${res.status} ${errorText}`)
    }
  } catch (error) {
    console.error("Token refresh error:", error)
    throw error
  }
}

/* -------------------------------------------------------------------------- */

async function logout(): Promise<void> {
  try {
    const response = await fetch("/api/auth/logout", { method: "POST" })
    if (!response.ok) {
      console.error("Logout API call failed:", response.status, response.statusText)
    }
  } catch (error) {
    console.error("Failed to send logout request:", error)
  }
}

/* -------------------------------------------------------------------------- */

interface FetchWithAuthOptions {
  method?: string
  body?: BodyInit | null
  headers?: HeadersInit
  credentials?: RequestCredentials
  retryOnAuthFail?: boolean
  parseResponse?: "json" | "text" | "blob" | "none"
}

let refreshPromise: Promise<void> | null = null

async function fetchWithAuth<T = unknown>(input: RequestInfo | URL, init: FetchWithAuthOptions = {}): Promise<T> {
  const { retryOnAuthFail = true, parseResponse = "json", headers = {}, ...options } = init

  const requestHeaders = new Headers(headers)

  const makeRequest = () =>
    fetch(input, {
      ...options,
      headers: requestHeaders,
      credentials: "include",
    })

  let response = await makeRequest()

  if ([401, 403].includes(response.status) && retryOnAuthFail) {
    try {
      if (refreshPromise) {
        await refreshPromise
      } else {
        refreshPromise = refreshToken().finally(() => {
          refreshPromise = null
        })
        await refreshPromise
      }
      response = await makeRequest()
    } catch (refreshError) {
      console.error("Token refresh failed, redirecting to login")
      await logout()
      window.location.href = "/login"
      throw new Error(`Authentication failed: ${refreshError}`)
    }
  }

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

export { refreshToken, logout, fetchWithAuth }
