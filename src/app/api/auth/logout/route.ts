import { NextResponse } from "next/server"
import { authServerAPI } from "@/lib/auth/server"

export async function POST() {
  await authServerAPI.logout()

  return NextResponse.json({ success: true }, { status: 200 })
}
