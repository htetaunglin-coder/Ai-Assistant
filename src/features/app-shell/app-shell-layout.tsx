import { Sidebar, SidebarContent, SidebarIcon, SidebarItem, SidebarToggler } from "@/components/ui/sidebar"
import {
  ResizableLayoutClose,
  ResizableLayoutContent,
  ResizableLayoutGroup,
  ResizableLayoutGroupProps,
  ResizableLayoutPanel,
  ResizableLayoutProvider,
  ResizableLayoutProviderProps,
} from "@/components/resizable-layout"
import Image from "next/image"
import Link from "next/link"
import React from "react"
import { ResizableLayoutOpen } from "@/components/resizable-layout"
import { SidebarProvider } from "@/components/ui/sidebar"

import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Button, ScrollArea, tabsStyles } from "@mijn-ui/react"
import { Edit, Menu, X } from "lucide-react"
import { SIDEBAR_NAV_ITEMS } from "./constants"
import { PanelViewProvider, PanelViewProviderProps, PanelViewTrigger } from "./panel-view"
import { DynamicPanelContent } from "./panel/dynamic-panel-content"
import { ResizableLayoutCookieData } from "@/components/resizable-layout/constants"

const RESIZABLE_LAYOUT_PANEL_ID = "left_panel"
const RESIZABLE_LAYOUT_DEFAULT_STATE: ResizableLayoutCookieData = {
  states: {
    [RESIZABLE_LAYOUT_PANEL_ID]: false,
  },
  sizes: [0, 100],
}

/* -------------------------------------------------------------------------- */

const MAIN_AREA_PADDING = "0.5rem"
const HEADER_HEIGHT = "3.5rem"

type AppShellLayoutProps = {
  initialPanelView: PanelViewProviderProps["initialPanelView"]
  initialState?: ResizableLayoutProviderProps["initialState"]
  defaultLayout?: ResizableLayoutGroupProps["defaultLayout"]
  renderUser: React.ReactNode
  children: React.ReactNode
}

const AppShellLayout = ({
  children,
  initialPanelView,
  initialState = RESIZABLE_LAYOUT_DEFAULT_STATE.states,
  defaultLayout = RESIZABLE_LAYOUT_DEFAULT_STATE.sizes,
  renderUser,
}: AppShellLayoutProps) => {
  return (
    <PanelViewProvider initialPanelView={initialPanelView}>
      <ResizableLayoutProvider initialState={initialState}>
        <SidebarProvider>
          <div
            className="flex h-screen w-full bg-background"
            style={
              {
                "--main-area-padding": MAIN_AREA_PADDING,
                "--header-height": HEADER_HEIGHT,
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
                  <ResizableLayoutPanel className="hidden md:block" id={RESIZABLE_LAYOUT_PANEL_ID} side="left">
                    <ResizableLayoutClose asChild id={RESIZABLE_LAYOUT_PANEL_ID}>
                      <div className="flex items-center justify-end p-2">
                        <Button variant="ghost" iconOnly>
                          <X />
                          <div className="sr-only">Close Panel</div>
                        </Button>
                      </div>
                    </ResizableLayoutClose>

                    <DynamicPanelContent />
                  </ResizableLayoutPanel>

                  <ResizableLayoutContent disableTransition className="relative">
                    {/* Desktop Header */}
                    <div className="absolute inset-x-0 top-4 z-50 hidden h-[var(--header-height)] w-full items-center justify-end bg-transparent px-6 md:flex">
                      {renderUser}
                    </div>

                    {/* Mobile Header */}
                    <div className="sticky z-50 flex h-[var(--header-height)] items-center justify-between bg-secondary px-4 md:hidden">
                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button iconOnly size="sm" variant="ghost" className="text-xl">
                            <Menu />
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent className="z-[99] flex w-full flex-col">
                          <DrawerTitle className="sr-only">Menu</DrawerTitle>
                          <div className={tabsStyles().list({ className: "flex-row" })}>
                            {SIDEBAR_NAV_ITEMS.map((item) => {
                              if (!item.panelViewId) return

                              return (
                                <PanelViewTrigger key={item.panelViewId} value={item.panelViewId} asChild>
                                  <button
                                    key={item.panelViewId}
                                    className={tabsStyles().trigger({ className: "w-full" })}>
                                    <item.icon />
                                    <p className="text-xs">{item.title}</p>
                                  </button>
                                </PanelViewTrigger>
                              )
                            })}
                          </div>

                          <ScrollArea className="h-[70vh] overflow-y-auto">
                            <DynamicPanelContent />
                          </ScrollArea>
                        </DrawerContent>
                      </Drawer>

                      <div className="flex items-center gap-2">
                        <Button title="new chat" variant="ghost" className="text-lg text-secondary-foreground" iconOnly>
                          <Edit />
                        </Button>
                        {renderUser}
                      </div>
                    </div>

                    <div className="md:pt-[var(--header-height)]">{children}</div>
                  </ResizableLayoutContent>
                </ResizableLayoutGroup>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </ResizableLayoutProvider>
    </PanelViewProvider>
  )
}

const AppShellSidebar = () => {
  const renderSidebarNavItems = SIDEBAR_NAV_ITEMS.map((item) => {
    const Icon = item.icon

    if (!item.panelViewId) {
      return (
        <SidebarItem asChild key={item.title} tooltip={item.tooltip}>
          <Link href={item.href ?? "#"}>
            <SidebarIcon>
              <Icon />
            </SidebarIcon>
            <p className="text-xs">{item.title}</p>
          </Link>
        </SidebarItem>
      )
    }

    return (
      <ResizableLayoutOpen id="left_panel" key={item.title} asChild>
        <PanelViewTrigger asChild value={item.panelViewId}>
          <SidebarItem tooltip={item.tooltip}>
            <SidebarIcon>
              <Icon />
            </SidebarIcon>
            <p className="text-xs">{item.title}</p>
          </SidebarItem>
        </PanelViewTrigger>
      </ResizableLayoutOpen>
    )
  })

  return (
    <>
      <Sidebar>
        <SidebarContent>
          <SidebarIcon asChild>
            <Link href="/chat" className="flex size-11 items-center justify-center rounded-md !p-1.5">
              <Image src="/images/picosbs.png" width={44} height={44} alt="Picosbs" />
            </Link>
          </SidebarIcon>

          {renderSidebarNavItems}
        </SidebarContent>
      </Sidebar>

      <SidebarToggler className="fixed bottom-6 left-6 z-50 bg-background text-lg text-secondary-foreground transition-all duration-300 hover:text-foreground data-[state=open]:bottom-4 data-[state=open]:left-5" />
    </>
  )
}

export default AppShellLayout
