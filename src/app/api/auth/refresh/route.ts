import { NextResponse } from "next/server"
import { setCookie } from "@/utils/cookies/server"
import { ACCESS_TOKEN } from "@/lib/auth/cookies"
import { authServerAPI } from "@/lib/auth/server"
import { ChatSDKError } from "@/lib/error"

export async function POST() {
  try {
    const newAccessToken = await authServerAPI.refreshToken()
    await setCookie(ACCESS_TOKEN, newAccessToken)

    return NextResponse.json({ data: { message: "Token refreshed" } }, { status: 200 })
  } catch (error) {
    console.error("Token refresh failed:", error)

    await authServerAPI.logout()

    if (error instanceof ChatSDKError) {
      return error.toResponse()
    }

    const refreshError = new ChatSDKError("unauthorized:auth", "Session expired. Please sign in again.")

    return refreshError.toResponse()
  }
}
