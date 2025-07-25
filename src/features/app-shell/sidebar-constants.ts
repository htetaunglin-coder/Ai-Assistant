import { Bot, Database, History, Layers, LucideIcon, Plus } from "lucide-react"
import { PANEL_VIEWS, PanelViewType } from "./panel/constants"

export type SidebarNavItem = {
  title: string
  icon: LucideIcon
  tooltip: string
  href?: string
  panelViewId?: PanelViewType
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
    panelViewId: PANEL_VIEWS.HISTORY,
  },
  {
    title: "Agents",
    icon: Bot,
    tooltip: "Agents",
    panelViewId: PANEL_VIEWS.AGENTS,
  },
  {
    title: "Projects",
    icon: Layers,
    tooltip: "Projects",
    panelViewId: PANEL_VIEWS.PROJECTS,
  },
  {
    title: "Upload",
    icon: Database,
    tooltip: "Upload",
    panelViewId: PANEL_VIEWS.UPLOADS,
  },
]
