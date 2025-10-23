import "server-only"
import { authServerAPI } from "@/lib/auth/server"

async function streamMessage(message: string): Promise<Response> {
  if (!message) {
    throw new Error("Missing message")
  }

  const response = await authServerAPI.fetchWithAuth<Response>(`${process.env.EXTERNAL_API_URL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: message }),
    parseResponse: "raw",
  })

  return response
}

export const chatServerAPI = {
  streamMessage,
}
