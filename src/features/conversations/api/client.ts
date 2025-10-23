import { authClientAPI } from "@/lib/auth/client"
import { ConversationAPIResponse, ConversationItem } from "../types"

/**
 * Fetch paginated conversations via GET /api/conversations?page=#
 *
 * Query param shape matches React Query infinite query { pageParam } usage.
 */
async function getConversationList({ pageParam = 0 }: { pageParam?: number } = {}): Promise<ConversationAPIResponse> {
  return authClientAPI.fetchWithAuth<ConversationAPIResponse>(`/api/conversations?page=${pageParam}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  })
}

/**
 * Search conversations via POST /api/conversations/search  { query }
 */
async function searchConversations(query: string): Promise<ConversationItem[]> {
  return authClientAPI.fetchWithAuth<ConversationItem[]>(`/api/conversations/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })
}

/**
 * Update conversation title via PATCH /api/conversations?id=...
 */
async function updateConversationTitle(id: string, newTitle: string): Promise<ConversationItem> {
  return authClientAPI.fetchWithAuth<ConversationItem>(`/api/conversations?id=${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: newTitle }),
  })
}

/**
 * Delete a conversation via DELETE /api/conversations?id=...
 */
async function deleteConversation(id: string): Promise<{ id: string }> {
  return authClientAPI.fetchWithAuth<{ id: string }>(`/api/conversations?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}

/**
 * Clear all conversations via DELETE /api/conversations/clear
 */
async function clearAllConversations(): Promise<{ success: boolean }> {
  return await authClientAPI.fetchWithAuth(`/api/conversations/clear`, {
    method: "DELETE",
  })
}

export const conversationClientAPI = {
  getConversationList,
  searchConversations,
  updateConversationTitle,
  deleteConversation,
  clearAllConversations,
}
