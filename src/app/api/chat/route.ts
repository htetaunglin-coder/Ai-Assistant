import { NextRequest } from "next/server"
import { chatServerAPI } from "@/features/chat/api/server"
import { ApplicationError } from "@/lib/error"

export const runtime = "edge"

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const backendResponse = await chatServerAPI.streamMessage(request)

    return new Response(backendResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  } catch (err) {
    if (err instanceof ApplicationError) {
      console.log(err)
      return err.toResponse()
    }
    console.error(`[ChatStream:POST] Unexpected error →`, err)

    const cause = err instanceof Error ? err.message : String(err)
    const error = new ApplicationError(
      "internal_server_error",
      "An unexpected error occurred. Please try again later.",
      cause,
    )
    return error.toResponse()
  }
}
