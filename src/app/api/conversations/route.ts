import { NextResponse } from "next/server"
import { conversationServerAPI } from "@/features/conversations/api/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const pageParam = Number(searchParams.get("page") || "0")
    const query = searchParams.get("search") || ""

    if (query.trim()) {
      // Delegate to service search (no pagination here - return full filtered list)
      const results = await conversationServerAPI.searchConversations(query)
      return NextResponse.json(results)
    }

    const data = await conversationServerAPI.getConversationList(pageParam)
    return NextResponse.json(data)
  } catch (err) {
    console.error("GET /api/conversations error:", err)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const result = await conversationServerAPI.clearAllConversations()
    return NextResponse.json(result)
  } catch (err) {
    console.error("DELETE /api/conversations error:", err)
    return NextResponse.json({ error: "Failed to clear conversations" }, { status: 500 })
  }
}
