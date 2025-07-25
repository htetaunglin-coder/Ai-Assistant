import { NextRequest } from "next/server"

// IMPORTANT! Set the runtime to edge
export const runtime = "edge"

export async function POST(req: NextRequest) {
  const { message } = await req.json()

  if (!process.env.OPENAI_API_KEY) {
    return new Response("Server Error: Couldn't find OPENAI API key.", { status: 500 })
  }

  if (!message) {
    return new Response("Bad Request: message is required.", { status: 400 })
  }

  try {
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [{ role: "user", content: message }],
        stream: true,
      }),
    })

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text()
      console.error("OpenAI API Error:", errorText)
      return new Response(`Error from OpenAI: ${errorText}`, { status: openAIResponse.status })
    }

    const stream = new ReadableStream({
      async start(controller) {
        if (!openAIResponse.body) {
          controller.close()
          return
        }

        const reader = openAIResponse.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            break // Exit the loop when the stream is done
          }

          // The 'value' is a Uint8Array. We can process it here if needed,
          // but for a simple pipe, we just forward it.
          // For this example, we'll decode and log it on the server too.
          const chunk = decoder.decode(value, { stream: true })
          console.log("[OpenAI Stream Chunk]:", chunk)

          controller.enqueue(value)
        }

        controller.close()
      },
      cancel() {
        console.log("Stream cancelled by client.")
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("[BFF Chat API Error]", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
