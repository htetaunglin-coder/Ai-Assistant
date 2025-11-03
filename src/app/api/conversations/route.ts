import { NextResponse } from "next/server"
import { conversationServerAPI } from "@/features/conversations/api/server"
import { ApplicationError } from "@/lib/error"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const pageParam = Number(searchParams.get("page") || "0")
    const query = searchParams.get("search") || ""

    if (query.trim()) {
      const results = await conversationServerAPI.searchConversations(query)
      return NextResponse.json(results)
    }

    const data = await conversationServerAPI.getConversationList(pageParam)
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof ApplicationError) {
      console.log(err)
      return err.toResponse()
    }
    console.error(`[Conversation:GET] Unexpected error →`, err)
    const cause = err instanceof Error ? err.message : String(err)
    const error = new ApplicationError("internal_server_error", "Failed to fetch conversations.", cause)
    return error.toResponse()
  }
}

export async function DELETE() {
  try {
    const result = await conversationServerAPI.clearAllConversations()
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof ApplicationError) {
      console.log(err)
      return err.toResponse()
    }
    console.error(`[Conversation:DELETE] Unexpected error →`, err)

    const cause = err instanceof Error ? err.message : String(err)
    const error = new ApplicationError("internal_server_error", "Failed to delete conversations.", cause)
    return error.toResponse()
  }
}
