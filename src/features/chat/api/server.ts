import "server-only"
import { authServerAPI } from "@/lib/auth/server"
import { ChatSDKError } from "@/lib/error"
import { chatStreamRequestBody, chatStreamRequestBodySchema } from "../schema"
import { BackendMessage } from "../stores/chat-store"

async function streamMessage(request: Request): Promise<Response> {
  let requestBody: chatStreamRequestBody

  try {
    const json = await request.json()
    console.log("json", json)
    requestBody = chatStreamRequestBodySchema.parse(json)
  } catch (_) {
    throw new ChatSDKError("bad_request:chat")
  }

  const response = await authServerAPI.fetchWithAuth<Response>(`${process.env.EXTERNAL_API_URL}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
    parseResponse: "raw",
  })

  return response
}

async function getMessages(id: string): Promise<BackendMessage[]> {
  const messages = await authServerAPI.fetchWithAuth<BackendMessage[]>(
    `${process.env.EXTERNAL_API_URL}/messages?conversation_id=${id}`,
    {
      headers: { "Content-Type": "application/json" },
      parseResponse: "json",
    },
  )

  return messages
}

export const chatServerAPI = {
  streamMessage,
  getMessages,
}
