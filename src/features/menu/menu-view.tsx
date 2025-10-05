"use client"

import { usePathname } from "next/navigation"
import { AgentsView } from "./components/agents-view"
import { HistoryView } from "./components/history-view"
import { ProjectsView } from "./components/projects-view"
import { UploadsView } from "./components/uploads-view"

const MenuView = () => {
  const pathname = usePathname().split("/").filter(Boolean)[0] || ""

  const renderContent = () => {
    switch (pathname) {
      case "chat":
        return <HistoryView />
      case "agents":
        return <AgentsView />
      case "projects":
        return <ProjectsView />
      case "files":
        return <UploadsView />
      default:
        return null
    }
  }

  return <>{renderContent()}</>
}

export { MenuView }
