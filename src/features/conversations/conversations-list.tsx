"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from "@mijn-ui/react"
import { isToday, isYesterday, subMonths, subWeeks } from "date-fns"
import { AlertCircle, Edit, LayoutList, Loader2, Search } from "lucide-react"
import { toast } from "sonner"
import { useDebounceCallback, useIntersectionObserver } from "usehooks-ts"
import { Tooltip } from "@/components/tooltip-wrapper"
import {
  useConversationsInfinite,
  useDeleteConversation,
  useSearchConversations,
  useUpdateConversationTitle,
} from "./api/queries"
import { ConversationListItem } from "./components/conversation-list-item"
import { ConversationItem } from "./types"

type DialogPayload = { type: "edit"; id: string; title: string } | { type: "delete"; id: string; title: string } | null

const ConversationsList = () => {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [activeDialog, setActiveDialog] = useState<DialogPayload>(null)

  const {
    data: conversationsData,
    isPending: conversationsLoading,
    isError: conversationsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversationsInfinite()

  const { data: searchData, isPending: searchLoading, isError: searchError } = useSearchConversations(debouncedQuery)

  const { ref: observerTarget, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "100px",
  })

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage])

  const debouncedSearch = useDebounceCallback((value: string) => {
    setDebouncedQuery(value)
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    debouncedSearch(value)
  }

  const openEditDialog = useCallback((id: string, title: string) => setActiveDialog({ type: "edit", id, title }), [])
  const openDeleteDialog = useCallback(
    (id: string, title: string) => setActiveDialog({ type: "delete", id, title }),
    [],
  )
  const closeDialog = useCallback(() => setActiveDialog(null), [])

  const isSearching = debouncedQuery.trim().length > 0
  const isLoading = isSearching ? searchLoading : conversationsLoading
  const isError = isSearching ? searchError : conversationsError
  const allConversations = conversationsData?.pages.flatMap((page) => page.items) || []
  const displayItems = isSearching ? searchData || [] : allConversations
  const activeConversationId = pathname.match(/^\/chat\/([^/]+)/)?.[1] || null

  const renderContent = () => {
    const hasNoItems = displayItems.length === 0

    if (isLoading && hasNoItems) {
      return (
        <div className="w-full space-y-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-8 w-full animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      )
    }

    if (isError) {
      return (
        <div className="p-2 text-sm text-danger-emphasis">Something went wrong! Please try refreshing the page.</div>
      )
    }

    if (hasNoItems) {
      return (
        <div className="p-2 text-sm text-secondary-foreground/70">
          {searchQuery ? `No results found for "${searchQuery}"` : "No conversations yet."}
        </div>
      )
    }

    if (isSearching) {
      return (
        <ul>
          {displayItems.map((item) => (
            <li key={item.id}>
              <ConversationListItem
                isActive={activeConversationId === item.id}
                item={item}
                onOpenEdit={openEditDialog}
                onOpenDelete={openDeleteDialog}
              />
            </li>
          ))}
        </ul>
      )
    }

    const grouped = groupConversationsByDate(displayItems)

    return (
      <div className="flex flex-col gap-6">
        {grouped.today.length > 0 && (
          <div>
            <div className="px-2 py-1 text-xs text-secondary-foreground/70">Today</div>
            <ul>
              {grouped.today.map((conv) => (
                <li key={conv.id}>
                  <ConversationListItem
                    isActive={activeConversationId === conv.id}
                    item={conv}
                    onOpenEdit={openEditDialog}
                    onOpenDelete={openDeleteDialog}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {grouped.yesterday.length > 0 && (
          <div>
            <div className="px-2 py-1 text-xs text-secondary-foreground/70">Yesterday</div>
            <ul>
              {grouped.yesterday.map((conv) => (
                <li key={conv.id}>
                  <ConversationListItem
                    isActive={activeConversationId === conv.id}
                    item={conv}
                    onOpenEdit={openEditDialog}
                    onOpenDelete={openDeleteDialog}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {grouped.lastWeek.length > 0 && (
          <div>
            <div className="px-2 py-1 text-xs text-secondary-foreground/70">Last 7 days</div>
            <ul>
              {grouped.lastWeek.map((conv) => (
                <li key={conv.id}>
                  <ConversationListItem
                    isActive={activeConversationId === conv.id}
                    item={conv}
                    onOpenEdit={openEditDialog}
                    onOpenDelete={openDeleteDialog}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {grouped.lastMonth.length > 0 && (
          <div>
            <div className="px-2 py-1 text-xs text-secondary-foreground/70">Last 30 days</div>
            <ul>
              {grouped.lastMonth.map((conv) => (
                <li key={conv.id}>
                  <ConversationListItem
                    isActive={activeConversationId === conv.id}
                    item={conv}
                    onOpenEdit={openEditDialog}
                    onOpenDelete={openDeleteDialog}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {grouped.older.length > 0 && (
          <div>
            <div className="px-2 py-1 text-xs text-secondary-foreground/70">Older than last month</div>
            <ul>
              {grouped.older.map((conv) => (
                <li key={conv.id}>
                  <ConversationListItem
                    isActive={activeConversationId === conv.id}
                    item={conv}
                    onOpenEdit={openEditDialog}
                    onOpenDelete={openDeleteDialog}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 space-y-2 p-6 pb-0 md:space-y-4">
        <h3 className="text-base font-medium md:text-lg">Chat</h3>

        <Input
          className="h-9 bg-background"
          startIcon={<Search className="!size-4" />}
          placeholder="Search chat..."
          value={searchQuery}
          onChange={handleSearchChange}
          aria-label="Search chat"
        />
      </header>

      <div className="mb-2 mt-4 flex items-center justify-between px-6">
        <p className="w-full truncate text-sm text-secondary-foreground/70">
          {isSearching ? `Search Results (${displayItems.length})` : "Recent Chat"}
        </p>

        <div className="flex items-center">
          <Tooltip content="Manage all chat" options={{ side: "bottom" }}>
            <Button variant="ghost" iconOnly asChild className="rounded-full text-secondary-foreground hover:bg-muted">
              <Link href="/conversations">
                <LayoutList className="size-4" />
                <span className="sr-only">Manage all chat</span>
              </Link>
            </Button>
          </Tooltip>

          <Tooltip content="New Chat" options={{ side: "bottom" }}>
            <Button variant="ghost" asChild iconOnly className="rounded-full text-secondary-foreground hover:bg-muted">
              <Link href="/chat">
                <Edit className="size-4" />
                <span className="sr-only">New Chat</span>
              </Link>
            </Button>
          </Tooltip>
        </div>
      </div>

      <div className="size-full space-y-1 overflow-y-auto overflow-x-hidden px-2 pb-4 lg:px-4">
        {renderContent()}

        {!isSearching && !isError && displayItems.length > 0 && (
          <div ref={observerTarget} className="py-4 text-center">
            {isFetchingNextPage ? (
              <div className="flex items-center justify-center gap-2 text-sm text-secondary-foreground/70">
                <Loader2 className="size-4 animate-spin" />
                <span>Loading more...</span>
              </div>
            ) : (
              !hasNextPage && <div className="text-sm text-secondary-foreground/70">No more conversations to load</div>
            )}
          </div>
        )}
      </div>

      {activeDialog?.type === "edit" && (
        <EditConversationDialog
          itemId={activeDialog.id}
          itemTitle={activeDialog.title}
          open={true}
          onClose={closeDialog}
        />
      )}

      {activeDialog?.type === "delete" && (
        <DeleteConversationDialog
          itemId={activeDialog.id}
          itemTitle={activeDialog.title}
          open={true}
          onClose={closeDialog}
        />
      )}
    </div>
  )
}

export default ConversationsList

/* --------------------------- Helper Functions ----------------------------- */

type GroupedChats = {
  today: ConversationItem[]
  yesterday: ConversationItem[]
  lastWeek: ConversationItem[]
  lastMonth: ConversationItem[]
  older: ConversationItem[]
}

function groupConversationsByDate(chats: ConversationItem[]): GroupedChats {
  const now = new Date()
  const oneWeekAgo = subWeeks(now, 1)
  const oneMonthAgo = subMonths(now, 1)

  return chats.reduce(
    (groups, chat) => {
      const chatDate = new Date(chat.created_time)

      if (isToday(chatDate)) {
        groups.today.push(chat)
      } else if (isYesterday(chatDate)) {
        groups.yesterday.push(chat)
      } else if (chatDate > oneWeekAgo) {
        groups.lastWeek.push(chat)
      } else if (chatDate > oneMonthAgo) {
        groups.lastMonth.push(chat)
      } else {
        groups.older.push(chat)
      }

      return groups
    },
    {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    } as GroupedChats,
  )
}

/* --------------------------- Dialog Components ---------------------------- */

const EditConversationDialog = ({
  itemId,
  itemTitle,
  open,
  onClose,
}: {
  itemId: string
  itemTitle: string
  open: boolean
  onClose: () => void
}) => {
  const [editTitle, setEditTitle] = useState(itemTitle)

  const {
    mutate: updateChatTitle,
    isPending: updateChatLoading,
    isError: updateChatError,
  } = useUpdateConversationTitle({
    onSuccess: () => {
      toast.success("Chat title updated successfully.")
      onClose()
    },
  })

  useEffect(() => {
    if (open) setEditTitle(itemTitle)
  }, [open, itemTitle])

  const handleSubmit = () => {
    const trimmed = editTitle.trim()
    if (trimmed && trimmed !== itemTitle) {
      updateChatTitle({ id: itemId, newTitle: trimmed })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !updateChatLoading) {
      handleSubmit()
    }
  }

  const isSaveDisabled = updateChatLoading || !editTitle.trim() || editTitle === itemTitle

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Chat Title</DialogTitle>
          <DialogDescription>Enter a new title for this conversation.</DialogDescription>
        </DialogHeader>

        {updateChatError && (
          <div className="flex items-center gap-x-2 rounded-md bg-danger-subtle p-3 text-sm text-danger-emphasis dark:bg-danger-subtle/20">
            <AlertCircle className="size-5" />
            <p>Failed to update chat title. Please try again.</p>
          </div>
        )}

        <div className="py-4">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Enter chat title..."
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={updateChatLoading} onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="primary" onClick={handleSubmit} disabled={isSaveDisabled}>
            {updateChatLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const DeleteConversationDialog = ({
  itemId,
  itemTitle,
  open,
  onClose,
}: {
  itemId: string
  itemTitle: string
  open: boolean
  onClose: () => void
}) => {
  const {
    mutate: deleteChat,
    isPending: deleteChatLoading,
    isError: deleteChatError,
  } = useDeleteConversation({
    onSuccess: () => {
      toast.success("Chat deleted successfully.")
      onClose()
    },
  })

  const handleConfirm = () => deleteChat(itemId)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Chat</DialogTitle>
          <DialogDescription>
            You&apos;re about to permanently delete the conversation
            <span className="px-1 font-medium italic text-danger-emphasis underline">{itemTitle}</span>. Once deleted,
            it cannot be recovered.
          </DialogDescription>
        </DialogHeader>

        {deleteChatError && (
          <div className="flex items-center gap-x-2 rounded-md bg-danger-subtle p-3 text-sm text-danger-emphasis dark:bg-danger-subtle/20">
            <AlertCircle className="size-5" />
            <p>Failed to delete chat. Please try again.</p>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={deleteChatLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="danger" onClick={handleConfirm} disabled={deleteChatLoading}>
            {deleteChatLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Delete Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
