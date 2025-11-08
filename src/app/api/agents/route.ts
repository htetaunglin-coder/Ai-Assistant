import { NextResponse } from "next/server"
import { agentsServerAPI } from "@/features/agents/api/server"
import { ApplicationError } from "@/lib/error"

export async function GET() {
  try {
    const data = await agentsServerAPI.getAgentsList()
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof ApplicationError) {
      console.log(err)
      return err.toResponse()
    }
    console.error(`[Agents:GET] Unexpected error →`, err)
    const cause = err instanceof Error ? err.message : String(err)
    const error = new ApplicationError("internal_server_error", "Failed to fetch agents.", cause)
    return error.toResponse()
  }
}
