import { NextResponse } from "next/server"
import { setCookie } from "@/utils/cookies/server"
import { ACCESS_TOKEN } from "@/lib/auth/cookies"
import { authServerAPI } from "@/lib/auth/server"

export async function POST() {
  try {
    const newAccessToken = await authServerAPI.refreshToken()

    await setCookie(ACCESS_TOKEN, newAccessToken)

    return NextResponse.json({ data: { message: "Token refreshed" } }, { status: 200 })
  } catch (error: any) {
    console.error("Refresh Error:", error)

    await authServerAPI.logout()
    return NextResponse.json({ error: { message: error.message || "Failed to refresh token" } }, { status: 401 })
  }
}
