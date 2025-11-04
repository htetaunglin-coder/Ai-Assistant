import { type InfiniteData, type QueryClient } from "@tanstack/react-query"
import { ConversationAPIResponse, ConversationItem } from "../types"
import { conversationKeys } from "./queries"

type ConversationInfiniteData = InfiniteData<ConversationAPIResponse>
/**
 * Immutably upserts or prepends a conversation item in paginated data.
 *
 * @param oldData - Existing infinite query data (may be undefined on first call)
 * @param newItem - Conversation item to upsert or prepend
 * @returns Updated infinite query data with the item upserted or prepended
 *
 * Behavior:
 * - If item exists (by ID): updates only the `updated_at` timestamp
 * - If item doesn't exist: prepends to the first page
 * - If no cache exists: creates initial paginated structure
 */
export function upsertOrPrependConversationItem(
  oldData: ConversationInfiniteData | undefined,
  newItem: ConversationItem,
): ConversationInfiniteData {
  const nowIso = new Date().toISOString()

  // Ensure timestamps are set
  const item: ConversationItem = {
    ...newItem,
    created_at: newItem.created_at ?? nowIso,
    updated_at: newItem.updated_at ?? nowIso,
  }

  // Handle empty cache - create initial structure
  if (!oldData?.pages?.length) {
    return {
      pages: [
        {
          data: [item],
          current_page: 1,
          last_page: 1,
          per_page: 10,
          from: 1,
          to: 1,
          total: 1,
          has_more: false,
        },
      ],
      pageParams: [0],
    }
  }

  // Try to find and update existing item
  let itemFound = false

  const updatedPages = oldData.pages.map((page): ConversationAPIResponse => {
    const updatedData = page.data.map((existingItem) => {
      if (existingItem.id === item.id) {
        itemFound = true
        // Only update timestamp, preserve all other fields (especially title)
        return { ...existingItem, updated_at: item.updated_at }
      }
      return existingItem
    })

    return { ...page, data: updatedData }
  })

  // If found, return with updated pages
  if (itemFound) {
    return { ...oldData, pages: updatedPages }
  }

  // Item not found - prepend to first page
  const firstPage = updatedPages[0]
  const updatedFirstPage: ConversationAPIResponse = {
    ...firstPage,
    data: [item, ...firstPage.data],
    total: firstPage.total + 1,
    to: firstPage.to + 1,
  }

  return {
    ...oldData,
    pages: [updatedFirstPage, ...updatedPages.slice(1)],
  }
}

/**
 * Upserts a chat history item into the React Query cache.
 * - Updates update_time if item exists.
 * - Prepends new item if not found.
 * - Creates initial paginated structure if cache is empty.
 */
export function upsertConversationItemInCache(queryClient: QueryClient, newItem: ConversationItem) {
  const key = conversationKeys.infiniteList()
  queryClient.setQueryData<ConversationInfiniteData | undefined>(key, (old) =>
    upsertOrPrependConversationItem(old, newItem),
  )
}
