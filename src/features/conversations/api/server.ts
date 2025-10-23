import "server-only"
// THIS IS A MOCK SERVER FILE AS THE BACKEND API ISN'T READY YET.
import { MOCK_CONVERSATIONS } from "./mock-data"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const PAGE_SIZE = 24

type ConversationItem = { id: string; title: string; create_time: string; update_time: string }

type ConversationAPIResponse = {
  items: ConversationItem[]
  next_page: number | null
  has_more: boolean
}

/**
 * List conversations (paginated).
 * page = 0 returns the first page.
 */
async function getConversationList(page = 0): Promise<ConversationAPIResponse> {
  await sleep(1200)

  const start = page * PAGE_SIZE
  const end = start + PAGE_SIZE
  const items = MOCK_CONVERSATIONS.items.slice(start, end)
  const hasMore = end < MOCK_CONVERSATIONS.items.length

  return {
    items,
    next_page: hasMore ? page + 1 : null,
    has_more: hasMore,
  }
}

/**
 * Search conversations by title (case-insensitive).
 */
async function searchConversations(query: string): Promise<ConversationItem[]> {
  await sleep(300)
  if (!query?.trim()) return []

  const q = query.toLowerCase()
  return MOCK_CONVERSATIONS.items.filter((it) => it.title.toLowerCase().includes(q))
}

/**
 * Update (rename) a conversation's title.
 * Returns the updated item.
 */
async function updateConversationTitle(id: string, newTitle: string): Promise<ConversationItem> {
  await sleep(800)

  // Simulate occasional failure
  if (Math.random() < 0.1) {
    throw new Error("Failed to update conversation title. Please try again.")
  }

  const item = MOCK_CONVERSATIONS.items.find((it) => it.id === id)
  if (!item) {
    throw new Error("Conversation not found")
  }

  item.title = newTitle
  item.update_time = new Date().toISOString()

  // return a shallow copy to avoid accidental external mutation
  return { ...item }
}

/**
 * Delete a single conversation by id.
 */
async function deleteConversation(id: string): Promise<{ id: string }> {
  await sleep(600)

  // Simulate occasional failure
  if (Math.random() < 0.1) {
    throw new Error("Failed to delete conversation. Please try again.")
  }

  const index = MOCK_CONVERSATIONS.items.findIndex((it) => it.id === id)
  if (index === -1) {
    throw new Error("Conversation not found")
  }

  MOCK_CONVERSATIONS.items.splice(index, 1)
  return { id }
}

/**
 * Clear all conversations.
 */
async function clearAllConversations(): Promise<{ success: boolean }> {
  await sleep(1000)

  // Simulate occasional failure
  if (Math.random() < 0.1) {
    throw new Error("Failed to clear conversation history. Please try again.")
  }

  MOCK_CONVERSATIONS.items = []
  return { success: true }
}

export const conversationServerAPI = {
  getConversationList,
  searchConversations,
  updateConversationTitle,
  deleteConversation,
  clearAllConversations,
}
