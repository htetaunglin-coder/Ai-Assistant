"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
} from "@mijn-ui/react"
import { AlertCircle, Edit, EllipsisVertical, LayoutList, Loader2, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useDebounceCallback, useIntersectionObserver } from "usehooks-ts"
import { Tooltip } from "@/components/tooltip-wrapper"
import { useChatHistoryInfinite, useDeleteChat, useSearchHistory, useUpdateChatTitle } from "../api/queries"

const HistoryView = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  const {
    data: historyData,
    isPending: historyLoading,
    isError: historyError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatHistoryInfinite()

  const { data: searchData, isPending: searchLoading, isError: searchError } = useSearchHistory(debouncedQuery)

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

  const isSearching = debouncedQuery.trim().length > 0
  const isLoading = isSearching ? searchLoading : historyLoading
  const isError = isSearching ? searchError : historyError
  const allHistoryItems = historyData?.pages.flatMap((page) => page.items) || []
  const displayItems = isSearching ? searchData || [] : allHistoryItems

  const renderHistoryList = () => {
    const hasNoItems = displayItems.length === 0

    if (isLoading && hasNoItems) {
      return (
        <div className="w-full space-y-1">
          {Array.from({ length: 15 }).map((_, i) => (
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
          {searchQuery ? `No results found for "${searchQuery}"` : "No chat history yet."}
        </div>
      )
    }

    return (
      <>
        {displayItems.map((item) => (
          <ChatListItem key={item.id} item={item} />
        ))}

        {!isSearching && (
          <div ref={observerTarget} className="py-4 text-center">
            {isFetchingNextPage ? (
              <div className="flex items-center justify-center gap-2 text-sm text-secondary-foreground/70">
                <Loader2 className="size-4 animate-spin" />
                <span>Loading more...</span>
              </div>
            ) : (
              !hasNextPage &&
              allHistoryItems.length > 0 && (
                <div className="text-sm text-secondary-foreground/50">No more chats to load</div>
              )
            )}
          </div>
        )}
      </>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 space-y-2 p-6 pb-0 md:space-y-4">
        <h3 className="text-base font-medium md:text-lg">Chats</h3>

        <Input
          className="h-9 bg-background"
          startIcon={<Search className="!size-4" />}
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </header>

      <div className="mb-2 mt-4 flex items-center justify-between px-6">
        <p className="text-sm text-secondary-foreground/70">
          {isSearching ? `Search Results (${displayItems.length})` : "Recent Chats"}
        </p>

        <div className="flex items-center ">
          <Tooltip
            content="Manage all chats"
            options={{
              side: "bottom",
            }}>
            <Button variant="ghost" iconOnly asChild className="rounded-full text-secondary-foreground hover:bg-muted">
              <Link href={"/history"}>
                <LayoutList className="size-4" />
                <span className="sr-only">Manage all chats</span>
              </Link>
            </Button>
          </Tooltip>

          <Tooltip content="New Chat" options={{ side: "bottom" }}>
            <Button variant="ghost" asChild iconOnly className="rounded-full text-secondary-foreground hover:bg-muted">
              <Link href="/chat">
                <Edit className="size-4" />
                <span className="sr-only">New chat</span>
              </Link>
            </Button>
          </Tooltip>
        </div>
      </div>

      <ul className="size-full overflow-y-auto overflow-x-hidden px-2 pb-4 lg:px-4">{renderHistoryList()}</ul>
    </div>
  )
}

export default HistoryView

/* --------------------------- Chat List Item ------------------------------- */

type ChatItem = {
  id: string
  title: string
  create_time: string
  update_time: string
}

const ChatListItem = ({ item }: { item: ChatItem }) => (
  <Button
    asChild
    variant="ghost"
    className="group relative w-full justify-start px-2.5 text-sm text-secondary-foreground hover:bg-muted hover:text-foreground lg:px-4">
    <li>
      <Link href={`/chat/${item.id}`} className="inline-block w-full truncate">
        {item.title}
      </Link>
      <ChatItemMenu itemId={item.id} itemTitle={item.title} />
    </li>
  </Button>
)

const ChatItemMenu = ({ itemId, itemTitle }: { itemId: string; itemTitle: string }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild unstyled>
      <Button
        iconOnly
        size="md"
        variant="ghost"
        className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 !ring-transparent !ring-offset-transparent hover:bg-muted group-hover:opacity-100 data-[state=open]:opacity-100">
        <EllipsisVertical />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" sideOffset={0} className="transition-none">
      <DropdownMenuGroup className="flex flex-col">
        <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
          <EditChatDialog itemId={itemId} itemTitle={itemTitle} />
        </DropdownMenuItem>

        <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
          <DeleteChatDialog itemId={itemId} itemTitle={itemTitle} />
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
)

/* --------------------------- Dialog Components ---------------------------- */

const EditChatDialog = ({ itemId, itemTitle }: { itemId: string; itemTitle: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(itemTitle)

  const {
    mutate: updateChatTitle,
    isPending: updateChatLoading,
    isError: updateChatError,
  } = useUpdateChatTitle({
    onSuccess: () => {
      toast.success("Chat title updated successfully.")
      setIsOpen(false)
    },
  })

  useEffect(() => {
    if (isOpen) setEditTitle(itemTitle)
  }, [isOpen, itemTitle])

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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild unstyled>
        <Button variant="ghost" size="sm" className="justify-start rounded-none text-secondary-foreground">
          <Edit className="mr-1.5 size-4" />
          Edit
        </Button>
      </DialogTrigger>

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
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={updateChatLoading}>
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

const DeleteChatDialog = ({ itemId, itemTitle }: { itemId: string; itemTitle: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  const {
    mutate: deleteChat,
    isPending: deleteChatLoading,
    isError: deleteChatError,
  } = useDeleteChat({
    onSuccess: () => {
      toast.success("Chat deleted successfully.")
      setIsOpen(false)
    },
  })

  const handleConfirm = () => deleteChat(itemId)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="justify-start rounded-none text-danger-emphasis">
          <Trash2 className="mr-1.5 size-4" />
          Delete Chat
        </Button>
      </DialogTrigger>

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
