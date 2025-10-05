"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button, tabsStyles } from "@mijn-ui/react"
import { Menu, X } from "lucide-react"
import { useIsMobile } from "@/hooks/use-screen-sizes"
import {
  ResizableLayoutClose,
  ResizableLayoutContent,
  ResizableLayoutGroup,
  ResizableLayoutOpen,
  ResizableLayoutPanel,
  ResizableLayoutProvider,
} from "@/components/resizable-layout"
import {
  Sidebar,
  SidebarContent,
  SidebarIcon,
  SidebarItem,
  SidebarProvider,
  SidebarToggler,
} from "@/components/sidebar"
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { SIDEBAR_NAV_ITEMS } from "./constants"
import { updateAppLayoutCookie } from "./utils/cookies/client"
import { AppLayoutCookieData } from "./utils/cookies/constants"

/* -------------------------------------------------------------------------- */
/*                                 Constants                                  */
/* -------------------------------------------------------------------------- */

const PANEL_IDS = {
  MENU: "menu_panel",
  ARTIFACT: "artifact_panel",
} as const

const DEFAULT_LAYOUT_VALUES: AppLayoutCookieData = {
  panels: { [PANEL_IDS.MENU]: false },
  sizes: [0, 100],
}

const AppLayout = ({
  children,
  defaultValues = DEFAULT_LAYOUT_VALUES,
  menuSlot,
  headerSlot,
  artifactSlot,
}: {
  children: React.ReactNode
  defaultValues?: AppLayoutCookieData
  menuSlot: React.ReactNode
  headerSlot: React.ReactNode
  artifactSlot?: React.ReactNode
}) => {
  const isMobile = useIsMobile()

  const handleOnPanelChange = (panels: Record<string, boolean>) => {
    // The artifact panel's state is not persisted in the cookie.
    // It will only be displayed based on the user's interaction.
    if (Object.keys(panels).includes(PANEL_IDS.ARTIFACT)) return

    updateAppLayoutCookie({ panels })
  }

  return (
    <SidebarProvider>
      <div
        className="flex h-svh w-full bg-background"
        style={
          {
            "--main-area-padding": "0.5rem",
            "--header-height": "3.5rem",
          } as React.CSSProperties
        }>
        <div className="size-full grow transition-[padding] duration-300 ease-in-out md:p-[var(--main-area-padding)] group-data-[state=open]/sidebar:md:pl-[calc(var(--sidebar-width)_+_var(--main-area-padding))]">
          <main className="size-full overflow-hidden bg-secondary md:rounded-md">
            <ResizableLayoutProvider defaultPanels={defaultValues.panels} onPanelChange={handleOnPanelChange}>
              <ResizableLayoutGroup direction="horizontal">
                <ResizableLayoutContent
                  defaultSize={50}
                  minSize={50}
                  maxSize={100}
                  className="resizable-layout-content">
                  <ResizableLayoutGroup
                    onLayoutChange={(sizes) => updateAppLayoutCookie({ sizes })}
                    direction="horizontal"
                    className="[&:not(:has(.resizable-layout-panel[data-resizing=true]))_.resizable-layout-content]:transition-[flex]">
                    {!isMobile && <AppLayoutSidebar />}

                    <ResizableLayoutPanel
                      minSize={15}
                      defaultSize={defaultValues.sizes[0]}
                      maxSize={30}
                      className="resizable-layout-panel group/menu-panel relative hidden md:block"
                      panelId={PANEL_IDS.MENU}
                      side="left">
                      <ResizableLayoutClose asChild panelId={PANEL_IDS.MENU}>
                        <Button
                          variant="ghost"
                          iconOnly
                          className="absolute right-4 top-6 z-10 rounded-full opacity-0 hover:bg-muted group-data-[state=open]/menu-panel:opacity-100">
                          <X className="!size-5" />
                          <span className="sr-only">Close Panel</span>
                        </Button>
                      </ResizableLayoutClose>
                      {!isMobile && (
                        <div className="hidden size-full opacity-0 transition-opacity duration-300 group-data-[state=open]/menu-panel:opacity-100 md:block">
                          {menuSlot}
                        </div>
                      )}
                    </ResizableLayoutPanel>

                    {/* Main Content Area */}
                    <ResizableLayoutContent
                      minSize={70}
                      defaultSize={defaultValues.sizes[1]}
                      maxSize={100}
                      className="resizable-layout-content relative w-screen transition-none duration-300 ease-in-out md:w-full">
                      {/* Header */}
                      <div className="sticky inset-x-0 z-20 flex h-[var(--header-height)] w-full items-center justify-between bg-secondary px-4 md:absolute md:top-4 md:justify-end md:bg-transparent md:px-6">
                        <MobileDrawer menuSlot={menuSlot} />
                        {headerSlot}
                      </div>

                      {children}
                    </ResizableLayoutContent>
                  </ResizableLayoutGroup>
                </ResizableLayoutContent>

                <ArtifactPanel className="hidden md:block">{!isMobile && artifactSlot}</ArtifactPanel>
              </ResizableLayoutGroup>
            </ResizableLayoutProvider>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Artifact Panel                               */
/* --------------------------------------------------------------------------- */

type ArtifactPanelProps = {
  children?: React.ReactNode
  className?: string
}

const ArtifactPanel = ({ children, className }: ArtifactPanelProps) => {
  return (
    <ResizableLayoutPanel
      panelId={PANEL_IDS.ARTIFACT}
      side="right"
      minSize={30}
      defaultSize={0}
      maxSize={50}
      className={className}>
      <div className="relative size-full bg-muted">
        <ResizableLayoutClose asChild panelId={PANEL_IDS.ARTIFACT} className="absolute right-4 top-4 z-20">
          <Button variant="ghost" iconOnly size="sm" className="rounded-full">
            <X />
            <span className="sr-only">Close Artifact Panel</span>
          </Button>
        </ResizableLayoutClose>
        {children}
      </div>
    </ResizableLayoutPanel>
  )
}

export { AppLayout, ArtifactPanel, PANEL_IDS }

/* -------------------------------------------------------------------------- */
/*                               Mobile Drawer                               */
/* -------------------------------------------------------------------------- */

type MobileDrawerProps = {
  menuSlot?: React.ReactNode
}

const MobileDrawer = ({ menuSlot }: MobileDrawerProps) => {
  const isMobile = useIsMobile()

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button iconOnly size="sm" variant="ghost" className="text-xl md:hidden">
          <Menu />
          <span className="sr-only">Open menu</span>
        </Button>
      </DrawerTrigger>

      {isMobile && (
        <DrawerContent className="z-50 flex w-full flex-col md:hidden">
          <DrawerTitle className="sr-only">Navigation Menu</DrawerTitle>

          <div className={tabsStyles().list({ className: "flex-row" })}>
            {SIDEBAR_NAV_ITEMS.map((item) => (
              <Link href={item.href} className={tabsStyles().trigger({ className: "w-full" })} key={item.id}>
                <item.icon />
                <span className="text-xs">{item.title}</span>
              </Link>
            ))}
          </div>

          <div className="h-[70svh]">{menuSlot}</div>
        </DrawerContent>
      )}
    </Drawer>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 Sidebar                                    */
/* -------------------------------------------------------------------------- */

const AppLayoutSidebar = () => {
  const renderSidebarItem = (item: (typeof SIDEBAR_NAV_ITEMS)[0]) => {
    const Icon = item.icon

    return (
      <ResizableLayoutOpen panelId={PANEL_IDS.MENU} asChild key={item.id}>
        <SidebarItem asChild tooltip={item.tooltip}>
          <Link href={item.href ?? "#"}>
            <SidebarIcon>
              <Icon />
            </SidebarIcon>
            <span className="text-xs">{item.title}</span>
          </Link>
        </SidebarItem>
      </ResizableLayoutOpen>
    )
  }

  return (
    <>
      <Sidebar className="fixed inset-y-0 left-0 z-30 hidden shrink-0 bg-background md:block">
        <SidebarContent>
          <SidebarIcon asChild>
            <Link
              href="/chat"
              className="flex size-11 items-center justify-center rounded-md !p-1.5"
              aria-label="Picosbs Home">
              <Image src="/images/picosbs.png" width={44} height={44} alt="Picosbs" priority />
            </Link>
          </SidebarIcon>
          {SIDEBAR_NAV_ITEMS.map(renderSidebarItem)}
        </SidebarContent>
      </Sidebar>

      <SidebarToggler className="fixed bottom-6 left-6 z-40 bg-background text-lg text-secondary-foreground transition-all duration-300 hover:text-foreground data-[state=open]:bottom-4 data-[state=open]:left-5" />
    </>
  )
}
