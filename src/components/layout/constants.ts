import { Bot, Files, Layers, LucideIcon, MessageCircleMore } from "lucide-react"

export type SidebarNavItem = {
  id: string
  title: string
  icon: LucideIcon
  tooltip: string
  href: string
}

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  {
    id: "sidebar-nav-item-0",
    title: "Chats",
    href: "/chat",
    icon: MessageCircleMore,
    tooltip: "Chats",
  },
  {
    id: "sidebar-nav-item-1",
    title: "Agents",
    href: "/agents",
    icon: Bot,
    tooltip: "Agents",
  },
  {
    id: "sidebar-nav-item-2",
    title: "Projects",
    icon: Layers,
    href: "#",
    tooltip: "Projects",
  },
  {
    id: "sidebar-nav-item-3",
    title: "Files",
    icon: Files,
    href: "#",
    tooltip: "Files",
  },
]
