import { NextResponse } from "next/server"
import { conversationServerAPI } from "@/features/conversations/api/server"
import { ApplicationError } from "@/lib/error"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) {
      throw new ApplicationError("bad_request", "Conversation ID is required.")
    }

    const body = await req.json().catch(() => {
      throw new ApplicationError("bad_request", "Invalid JSON body.")
    })

    const newTitle = (body && body.title) || ""

    if (!newTitle || !newTitle.trim()) {
      throw new ApplicationError("bad_request", "A new title is required.")
    }

    const updated = await conversationServerAPI.updateConversationTitle(id, newTitle.trim())
    return NextResponse.json(updated)
  } catch (err) {
    console.error(`PATCH /api/conversations/${params?.id} error:`, err)
    if (err instanceof ApplicationError) {
      return err.toResponse()
    }
    const cause = err instanceof Error ? err.message : String(err)
    return new ApplicationError("internal_server_error", "Failed to update conversation.", cause).toResponse()
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) {
      throw new ApplicationError("bad_request", "Conversation ID is required.")
    }

    const result = await conversationServerAPI.deleteConversation(id)
    return NextResponse.json(result)
  } catch (err) {
    console.error(`DELETE /api/conversations/${params?.id} error:`, err)
    if (err instanceof ApplicationError) {
      return err.toResponse()
    }
    const cause = err instanceof Error ? err.message : String(err)
    return new ApplicationError("internal_server_error", "Failed to delete conversation.", cause).toResponse()
  }
}
