import { PANEL_VIEWS, PanelViewType } from "@/features/panel/constants";
import { Bot, Database, History, Layers, LucideIcon, Plus } from "lucide-react";

export type SidebarNavItem = {
  title: string;
  icon: LucideIcon;
  tooltip: string;
  href?: string;
  panelId?: PanelViewType;
};

export const sidebarNavItems: SidebarNavItem[] = [
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
    panelId: PANEL_VIEWS.HISTORY,
  },
  {
    title: "Agents",
    icon: Bot,
    tooltip: "Agents",
    panelId: PANEL_VIEWS.AGENTS,
  },
  {
    title: "Projects",
    icon: Layers,
    tooltip: "Projects",
    panelId: PANEL_VIEWS.PROJECTS,
  },
  {
    title: "Upload",
    icon: Database,
    tooltip: "Upload",
    panelId: PANEL_VIEWS.UPLOADS,
  },
];
