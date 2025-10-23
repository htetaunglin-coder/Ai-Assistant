import { NextRequest } from "next/server"
import { chatServerAPI } from "@/features/chat/api/server"

export const runtime = "edge"

export async function POST(req: NextRequest): Promise<Response> {
  const { message }: { message: string } = await req.json()

  if (!message) {
    return new Response("Missing message", { status: 400 })
  }

  try {
    const backendResponse = await chatServerAPI.streamMessage(message)

    return new Response(backendResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  } catch (err) {
    console.error("Chat proxy error:", err)
    return new Response("Internal Server Error", { status: 500 })
  }
}
