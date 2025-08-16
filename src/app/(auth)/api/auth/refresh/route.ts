import { NextResponse } from "next/server"
import { setCookie } from "@/utils/cookies/server"
import { ACCESS_TOKEN, authServer } from "@/lib/auth"

export async function POST() {
  try {
    const newAccessToken = await authServer.refreshToken()

    await setCookie(ACCESS_TOKEN, newAccessToken)

    return NextResponse.json({ data: { message: "Token refreshed" } }, { status: 200 })
  } catch (error: any) {
    console.error("Refresh Error:", error)

    await authServer.logout()
    return NextResponse.json({ error: { message: error.message || "Failed to refresh token" } }, { status: 401 })
  }
}
