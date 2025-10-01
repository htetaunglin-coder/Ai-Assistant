import { Bot, Database, History, Layers, LucideIcon, Plus } from "lucide-react"

export const MENU_PANELS = {
  HISTORY: "history",
  AGENTS: "agents",
  PROJECTS: "projects",
  UPLOADS: "upload",
} as const

export type MenuPanelType = (typeof MENU_PANELS)[keyof typeof MENU_PANELS]

/* -------------------------------------------------------------------------- */

export type SidebarNavItem = {
  title: string
  icon: LucideIcon
  tooltip: string
  href?: string
  panelViewId?: MenuPanelType
}

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  {
    title: "New",
    href: "/chat",
    icon: Plus,
    tooltip: "New Chat",
  },
  {
    title: "History",
    icon: History,
    tooltip: "History",
    panelViewId: MENU_PANELS.HISTORY,
  },
  {
    title: "Agents",
    icon: Bot,
    tooltip: "Agents",
    panelViewId: MENU_PANELS.AGENTS,
  },
  {
    title: "Projects",
    icon: Layers,
    tooltip: "Projects",
    panelViewId: MENU_PANELS.PROJECTS,
  },
  {
    title: "Upload",
    icon: Database,
    tooltip: "Upload",
    panelViewId: MENU_PANELS.UPLOADS,
  },
]
