import { NextRequest } from "next/server"
import { chatServerAPI } from "@/features/chat/api/server"
import { ChatSDKError } from "@/lib/error"

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
    if (err instanceof ChatSDKError) {
      console.log(err)
      return err.toResponse()
    }
    console.error("Chat proxy error:", err)

    const error = new ChatSDKError("internal_server_error:api", "An unexpected error occurred. Please try again later.")
    return error.toResponse()
  }
}
