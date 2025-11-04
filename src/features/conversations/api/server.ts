import "server-only"
import { authServerAPI } from "@/lib/auth/server"
import { ConversationAPIResponse, ConversationItem } from "../types"

// const PAGE_SIZE = 24

async function getConversationList(page = 1): Promise<ConversationAPIResponse> {
  return authServerAPI.fetchWithAuth<ConversationAPIResponse>(
    `${process.env.EXTERNAL_API_URL}/conversations?page=${page}`,
    {
      parseResponse: "json",
    },
  )
}

/**
 * Search conversations by title (case-insensitive).
 */
async function searchConversations(query: string): Promise<ConversationItem[]> {
  return authServerAPI.fetchWithAuth<ConversationItem[]>(
    `${process.env.EXTERNAL_API_URL}/conversations?search=${query}`,
    {
      method: "GET",
      parseResponse: "json",
    },
  )
}

/**
 * Update (rename) a conversation's title.
 * Returns the updated item.
 */
async function updateConversationTitle(id: string, newTitle: string): Promise<ConversationItem> {
  return authServerAPI.fetchWithAuth<ConversationItem>(`${process.env.EXTERNAL_API_URL}/conversations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: newTitle }),
    parseResponse: "json",
  })
}

/**
 * Delete a single conversation by id.
 */
async function deleteConversation(id: string): Promise<{ success: boolean }> {
  return authServerAPI.fetchWithAuth<{ success: boolean }>(`${process.env.EXTERNAL_API_URL}/conversations/${id}`, {
    method: "DELETE",
    parseResponse: "json",
  })
}

/**
 * Clear all conversations.
 */
async function clearAllConversations(): Promise<{ success: boolean }> {
  return authServerAPI.fetchWithAuth<{ success: boolean }>(`${process.env.EXTERNAL_API_URL}/conversations`, {
    method: "DELETE",
    parseResponse: "json",
  })
}

export const conversationServerAPI = {
  getConversationList,
  searchConversations,
  updateConversationTitle,
  deleteConversation,
  clearAllConversations,
}
