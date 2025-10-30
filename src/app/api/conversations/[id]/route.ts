import { NextResponse } from "next/server"
import { conversationServerAPI } from "@/features/conversations/api/server"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    const body = await req.json().catch(() => ({}))

    const newTitle = (body && body.title) || ""

    if (!newTitle || !newTitle.trim()) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 })
    }

    const updated = await conversationServerAPI.updateConversationTitle(id, newTitle.trim())
    return NextResponse.json(updated)
  } catch (err) {
    console.error(`PATCH /api/conversations/${params?.id} error:`, err)
    return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    const result = await conversationServerAPI.deleteConversation(id)
    return NextResponse.json(result)
  } catch (err) {
    console.error(`DELETE /api/conversations/${params?.id} error:`, err)
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 })
  }
}
