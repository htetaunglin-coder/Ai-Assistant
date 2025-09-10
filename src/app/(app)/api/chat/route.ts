import { ACCESS_TOKEN } from "@/lib/auth"
import { getCookie } from "@/utils/cookies/server"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function POST(req: NextRequest): Promise<Response> {
  const { message }: { message: string } = await req.json()
  const access_token = await getCookie(ACCESS_TOKEN);

  if (!message) {
    return new Response("Missing message", { status: 400 })
  }

  if (!access_token) {
    console.log('unauthorize',access_token);
    
    throw new Response("Unauthorize",{status : 519})
  }

  try {
    const openAIResponse = await fetch(`${process.env.EXTERNAL_API_URL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        content: message,
      }),
    })

    if (!openAIResponse.ok || !openAIResponse.body) {
      const errorText = await openAIResponse.text();
      console.log(errorText,'here is error text');
      
      return new Response(errorText, { status: openAIResponse.status })
    }

    console.log('Successfully got response');
    
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
