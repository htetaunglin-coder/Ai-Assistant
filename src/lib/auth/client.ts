"use client"

import { ChatSDKError, ErrorCode } from "../error"
import { ParseResponseOptions, parseResponse as parseResponseFn } from "../parse-response"

async function refreshToken(): Promise<void> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
    if (!response.ok) {
      const { code, cause } = await response.json()
      throw new ChatSDKError(code as ErrorCode, cause)
    }
  } catch (error: unknown) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new ChatSDKError("offline:chat")
    }

    throw error
  }
}

/* -------------------------------------------------------------------------- */

async function logout(): Promise<void> {
  try {
    const response = await fetch("/api/auth/logout", { method: "POST" })
    if (!response.ok) {
      const { code, cause } = await response.json()
      throw new ChatSDKError(code as ErrorCode, cause)
    }
  } catch (error: unknown) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new ChatSDKError("offline:chat")
    }

    throw error
  }
}

/* -------------------------------------------------------------------------- */

type FetchWithAuthOptions = {
  method?: string
  body?: BodyInit | null
  headers?: HeadersInit
  credentials?: RequestCredentials
  retryOnAuthFail?: boolean
  parseResponse?: ParseResponseOptions
  signal?: AbortSignal
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
      const cause = refreshError instanceof Error ? refreshError.message : String(refreshError)
      throw new ChatSDKError("unauthorized:auth", `Authentication failed: ${cause}`)
    }
  }

  if (!response.ok) {
    const { code, cause } = await response.json()
    throw new ChatSDKError(code as ErrorCode, cause)
  }

  return parseResponseFn<T>(response, parseResponse)
}

export const authClientAPI = { refreshToken, logout, fetchWithAuth }
