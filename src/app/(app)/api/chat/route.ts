import { NextRequest } from "next/server"
import { authServer } from "@/lib/auth"

export const runtime = "edge"

export async function POST(req: NextRequest): Promise<Response> {
  const { message }: { message: string } = await req.json()

  if (!message) {
    return new Response("Missing message", { status: 400 })
  }

  try {
    const openAIResponse = await authServer.fetchWithAuth<Response>(`${process.env.EXTERNAL_API_URL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
      parseResponse: "raw",
    })

    return new Response(openAIResponse.body, {
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
