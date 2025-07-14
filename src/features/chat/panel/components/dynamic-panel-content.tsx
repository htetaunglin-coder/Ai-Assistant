"use client";

import { ResizableLayoutPanelClose } from "@/features/chat/components/resizable-layout";
import { PANEL_VIEWS } from "../../constants";
import { usePanelContext } from "../context/panel-context";
import { AgentsView } from "./agents-view";
import { HistoryView } from "./history-view";
import { ProjectsView } from "./projects-view";
import { UploadsView } from "./uploads-view";

export const DynamicPanelContent = () => {
  const { activePanel } = usePanelContext();

  const renderContent = () => {
    switch (activePanel) {
      case PANEL_VIEWS.HISTORY:
        return <HistoryView />;
      case PANEL_VIEWS.AGENTS:
        return <AgentsView />;
      case PANEL_VIEWS.PROJECTS:
        return <ProjectsView />;
      case PANEL_VIEWS.UPLOADS:
        return <UploadsView />;
      default:
        return null;
    }
  };

  return (
    <div className="size-full">
      <div className="flex items-center justify-end p-2">
        <ResizableLayoutPanelClose />
      </div>
      {renderContent()}
    </div>
  );
};
