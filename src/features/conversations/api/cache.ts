import { type InfiniteData, type QueryClient } from "@tanstack/react-query"
import { ConversationItem, Conversations } from "../types"
import { conversationKeys } from "./queries"

/**
 * Immutable upsert/prepend helper for paginated chat history.
 * - If item exists: update only update_time (preserve title).
 * - If not found: prepend to first page.
 * - If no cache exists: create initial paginated shape.
 */
export function upsertOrPrependConversationItem(
  oldData: InfiniteData<Conversations> | undefined,
  newItem: ConversationItem,
): InfiniteData<Conversations & { next_page?: number | null; has_more?: boolean }> {
  const nowIso = new Date().toISOString()
  const item: ConversationItem = {
    ...newItem,
    create_time: newItem.create_time ?? nowIso,
    update_time: newItem.update_time ?? nowIso,
  }

  if (!oldData || !oldData.pages || oldData.pages.length === 0) {
    return {
      pages: [
        {
          items: [item],
          next_page: null,
          has_more: true,
        },
      ],
      pageParams: [0],
    }
  }

  let found = false
  const pages = oldData.pages.map((page) => {
    const items = page.items.map((it) => {
      if (it.id === item.id) {
        found = true
        // update only update_time (preserve title)
        return { ...it, update_time: item.update_time }
      }
      return it
    })
    return { ...page, items }
  })

  if (found) return { ...oldData, pages }

  // Prepend to first page
  const first = oldData.pages[0]
  const newFirst = { ...first, items: [item, ...first.items] }
  const newPages = [newFirst, ...oldData.pages.slice(1)]
  return { ...oldData, pages: newPages }
}

/**
 * Upserts a chat history item into the React Query cache.
 * - Updates update_time if item exists.
 * - Prepends new item if not found.
 * - Creates initial paginated structure if cache is empty.
 */
export function upsertConversationItemInCache(queryClient: QueryClient, newItem: ConversationItem) {
  const key = conversationKeys.infiniteList()
  queryClient.setQueryData<InfiniteData<Conversations> | undefined>(key, (old) =>
    upsertOrPrependConversationItem(old, newItem),
  )
}
