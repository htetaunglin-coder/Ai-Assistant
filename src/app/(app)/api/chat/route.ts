import { NextRequest } from "next/server"

export const runtime = "edge"

export async function POST(req: NextRequest): Promise<Response> {
  const { message }: { message: string } = await req.json()

  if (!message) {
    return new Response("Missing message", { status: 400 })
  }

  if (!process.env.TEMP_ACCESS_TOKEN) {
    throw new Error("External Backend - TEMP_ACCESS_TOKEN is not defined")
  }

  try {
    const openAIResponse = await fetch(`https://ai-client-beta.vercel.app//chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TEMP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        content: message,
      }),
    })

    if (!openAIResponse.ok || !openAIResponse.body) {
      const errorText = await openAIResponse.text()
      return new Response(errorText, { status: openAIResponse.status })
    }

    // Just return the stream directly — no transformation
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
