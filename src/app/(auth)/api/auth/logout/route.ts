import { NextResponse } from "next/server"
import { authServer } from "@/lib/auth"

export async function POST() {
  await authServer.logout()

  return NextResponse.json({ success: true }, { status: 200 })
}
