import "server-only"
import { authServerAPI } from "@/lib/auth/server"
import { ApplicationError } from "@/lib/error"
import { chatStreamRequestBody, chatStreamRequestBodySchema } from "../schema"
import { MessageAPIResponse } from "../types"

async function streamMessage(request: Request): Promise<Response> {
  let requestBody: chatStreamRequestBody

  try {
    const json = await request.json()
    console.log("json", json)
    requestBody = chatStreamRequestBodySchema.parse(json)
  } catch (error) {
    const cause = error instanceof Error ? error.message : String(error)
    throw new ApplicationError("bad_request", "Invalid request body.", cause)
  }

  const response = await authServerAPI.fetchWithAuth<Response>(`${process.env.EXTERNAL_API_URL}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
    parseResponse: "raw",
  })

  return response
}

async function getMessages(id: string): Promise<MessageAPIResponse> {
  const messages = await authServerAPI.fetchWithAuth<MessageAPIResponse>(
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
