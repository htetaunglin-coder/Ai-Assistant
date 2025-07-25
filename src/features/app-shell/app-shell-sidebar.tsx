"use client"

import { Sidebar, SidebarContent, SidebarIcon, SidebarItem, SidebarToggler } from "@/components/ui/sidebar"
import Image from "next/image"
import Link from "next/link"
import React from "react"
import { usePanelContext } from "./panel/context/panel-context"
import { SIDEBAR_NAV_ITEMS } from "./sidebar-constants"
import { ResizableLayoutOpen } from "./components/resizable-layout"

const AppShellSidebar = () => {
  const { setActivePanelView: setActivePanel } = usePanelContext()

  const renderSidebarNavItems = SIDEBAR_NAV_ITEMS.map((item) => {
    const Icon = item.icon

    if (item.href) {
      return (
        <SidebarItem asChild key={item.title} tooltip={item.tooltip}>
          <Link href={item.href}>
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
        <SidebarItem tooltip={item.tooltip} onClick={() => item.panelViewId && setActivePanel(item.panelViewId)}>
          <SidebarIcon>
            <Icon />
          </SidebarIcon>
          <p className="text-xs">{item.title}</p>
        </SidebarItem>
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

export { AppShellSidebar }
