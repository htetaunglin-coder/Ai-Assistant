"use client"

import { ResizableLayoutClose } from "@/features/app-shell/components/resizable-layout"

import { AgentsView } from "./components/agents-view"
import { HistoryView } from "./components/history-view"
import { ProjectsView } from "./components/projects-view"
import { UploadsView } from "./components/uploads-view"
import { X } from "lucide-react"
import { Button } from "@mijn-ui/react"
import { PANEL_VIEWS } from "./constants"
import { usePanelContext } from "./context/panel-context"

export const DynamicPanelContent = () => {
  const { activePanelView } = usePanelContext()

  const renderContent = () => {
    switch (activePanelView) {
      case PANEL_VIEWS.HISTORY:
        return <HistoryView />
      case PANEL_VIEWS.AGENTS:
        return <AgentsView />
      case PANEL_VIEWS.PROJECTS:
        return <ProjectsView />
      case PANEL_VIEWS.UPLOADS:
        return <UploadsView />
      default:
        return null
    }
  }

  return (
    <div className="size-full">
      <div className="flex items-center justify-end p-2">
        <ResizableLayoutClose asChild id="left_panel">
          <Button variant="ghost" iconOnly>
            <X />
            <div className="sr-only">Close Panel</div>
          </Button>
        </ResizableLayoutClose>
      </div>
      {renderContent()}
    </div>
  )
}
