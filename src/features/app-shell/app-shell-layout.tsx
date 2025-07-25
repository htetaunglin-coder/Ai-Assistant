import React from "react"

import {
  ResizableLayoutContent,
  ResizableLayoutGroup,
  ResizableLayoutGroupProps,
  ResizableLayoutPanel,
  ResizableLayoutProvider,
  ResizableLayoutProviderProps,
} from "@/features/app-shell/components/resizable-layout"
import { PANEL_IDS } from "@/features/app-shell/panel/constants"

import { SidebarProvider } from "@/components/ui/sidebar"

import { PanelProvider, PanelProviderProps } from "@/features/app-shell/panel/context/panel-context"

import { DynamicPanelContent } from "./panel/dynamic-panel-content"
import { AppShellSidebar } from "./app-shell-sidebar"

// 🛠 TODO: Unify layout panel state
// Currently, we rely on two separate cookies:
//  1. `chat_panel_active_view` → controls which panel view is active (e.g., 'history', 'uploads')
//  2. `resizable_layout_*` → controls whether the panel is open + its size
//
// These should eventually be unified into a single layout state structure (either in cookies or persisted server-side).
// This will simplify state syncing, reduce bugs from desync, and make future features (e.g. tabs, history) easier to build.

const MAIN_AREA_PADDING = "0.5rem"

type AppShellLayoutProps = {
  initialPanelView: PanelProviderProps["initialPanelView"]
  initialState: ResizableLayoutProviderProps["initialState"]
  defaultLayout: ResizableLayoutGroupProps["defaultLayout"]
  children: React.ReactNode
}

const AppShellLayout = ({ children, initialPanelView, initialState, defaultLayout }: AppShellLayoutProps) => {
  return (
    <PanelProvider initialPanelView={initialPanelView}>
      <ResizableLayoutProvider initialState={initialState}>
        <SidebarProvider>
          <div
            className="flex h-screen w-full bg-background"
            style={
              {
                "--main-area-padding": MAIN_AREA_PADDING,
              } as React.CSSProperties
            }>
            {/* Sidebar only on desktop */}
            <div className="hidden md:block">
              <AppShellSidebar />
            </div>

            {/* TODO: Implement Mobile Sidebar */}
            {/* ... */}

            {/* Main area including header and resizable panels */}
            <div className="h-full grow md:p-[var(--main-area-padding)]">
              <main className="size-full bg-secondary md:rounded-md">
                <ResizableLayoutGroup defaultLayout={defaultLayout} direction="horizontal">
                  <ResizableLayoutPanel id={PANEL_IDS.LEFT} side="left">
                    <DynamicPanelContent />
                  </ResizableLayoutPanel>

                  <ResizableLayoutContent>{children}</ResizableLayoutContent>
                </ResizableLayoutGroup>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </ResizableLayoutProvider>
    </PanelProvider>
  )
}

export default AppShellLayout
