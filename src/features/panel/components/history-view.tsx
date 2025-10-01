"use client"

import Link from "next/link"
import { Button, Input } from "@mijn-ui/react"
import { Search } from "lucide-react"
import { useChatHistory } from "../hooks/use-panel-queries"

type ChatItem = {
  id: string
  title: string
}

type ChatListProps = {
  items: ChatItem[]
}

const HistoryView = () => {
  const { data = [], isLoading, isError } = useChatHistory()

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="w-full space-y-1">
          {Array.from({ length: 15 }).map((_, index) => (
            <div key={index} className="h-8 w-full animate-pulse rounded-md bg-background/70" />
          ))}
        </div>
      )
    }

    if (isError) {
      return (
        <div className="p-2 text-sm text-danger-emphasis">Something went wrong! Please try refreshing the page.</div>
      )
    }
    return <ChatList items={data} />
  }

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 mb-2 space-y-2 p-6 pb-0 md:mb-4 md:space-y-4">
        <h3 className="text-base font-medium md:text-lg">History</h3>
        <Input className="h-9 bg-background" startIcon={<Search className="!size-4" />} placeholder="Search..." />
      </header>

      <p className="mb-2 px-6 text-sm text-secondary-foreground/70">Recent Chats</p>

      <ul className="size-full overflow-y-auto overflow-x-hidden px-2 pb-4 lg:px-4">{renderContent()}</ul>
    </div>
  )
}

const ChatList = ({ items }: ChatListProps) => {
  if (items.length === 0) {
    return <div className="p-2 text-sm text-secondary-foreground/70">No chat history yet.</div>
  }

  return (
    <>
      {items.map((item) => (
        <Button
          asChild
          variant="ghost"
          key={item.id}
          className="w-full justify-start px-2.5 text-sm text-secondary-foreground hover:bg-background hover:text-foreground lg:px-4">
          <li>
            <Link href={`/chat/${item.id}`} className="inline-block w-full truncate">
              {item.title}
            </Link>
          </li>
        </Button>
      ))}
    </>
  )
}

export { HistoryView }
