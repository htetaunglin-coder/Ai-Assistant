"use client"

import { memo } from "react"
import Link from "next/link"
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@mijn-ui/react"
import { Edit, EllipsisVertical, Trash2 } from "lucide-react"
import { ConversationItem } from "../types"

type ChatItemProps = {
  item: ConversationItem
  onOpenEdit: (id: string, title: string) => void
  onOpenDelete: (id: string, title: string) => void
  isActive: boolean
}

const PureConversationListItem = ({ item, isActive, onOpenEdit, onOpenDelete }: ChatItemProps) => {
  const href = `/chat/${item.id}`

  return (
    <Button
      asChild
      variant="ghost"
      className="group relative h-9 w-full justify-start truncate px-2.5 text-sm text-secondary-foreground hover:bg-muted hover:text-foreground lg:px-4">
      <Link
        href={href}
        data-state={isActive ? "active" : "inactive"}
        className="inline-block w-full data-[state=active]:bg-muted data-[state=active]:text-foreground">
        <span className="w-full truncate">{item.title}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild unstyled>
            <Button
              iconOnly
              size="md"
              variant="ghost"
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-muted opacity-0 !ring-transparent !ring-offset-transparent hover:bg-background group-hover:opacity-100 data-[state=open]:opacity-100"
              aria-label="More options">
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" sideOffset={0} className="transition-none">
            <DropdownMenuGroup className="flex flex-col">
              <DropdownMenuItem
                asChild
                onSelect={(e) => {
                  e.preventDefault()
                  onOpenEdit(item.id, item.title)
                }}>
                <Button variant="ghost" size="sm" className="justify-start rounded-none text-secondary-foreground">
                  <Edit className="mr-1.5 size-4" />
                  Edit
                </Button>
              </DropdownMenuItem>

              <DropdownMenuItem
                asChild
                onSelect={(e) => {
                  e.preventDefault()
                  onOpenDelete(item.id, item.title)
                }}>
                <Button variant="ghost" size="sm" className="justify-start rounded-none text-danger-emphasis">
                  <Trash2 className="mr-1.5 size-4" />
                  Delete Chat
                </Button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Link>
    </Button>
  )
}

export const ConversationListItem = memo(
  PureConversationListItem,
  (prev, next) => prev.isActive === next.isActive && prev.item.id === next.item.id,
)
