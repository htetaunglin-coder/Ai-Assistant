"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@mijn-ui/react"
import { X } from "lucide-react"
import { useIsMobile } from "@/hooks/use-screen-sizes"
import {
  ResizableLayoutClose,
  ResizableLayoutContent,
  ResizableLayoutGroup,
  ResizableLayoutOpen,
  ResizableLayoutPanel,
  ResizableLayoutProvider,
} from "@/components/resizable-layout"
import { SIDEBAR_NAV_ITEMS } from "../constants"
import { Layout, LayoutContent, LayoutContentWrapper, LayoutDrawer, LayoutSidebar, LayoutSidebarItem } from "../layout"
import { updateWorkspaceLayoutCookie } from "./utils/cookies/client"
import { WorkspaceLayoutCookieData } from "./utils/cookies/constants"

/* -------------------------------------------------------------------------- */
/*                                 Constants                                  */
/* -------------------------------------------------------------------------- */

const PANEL_IDS = {
  MENU: "menu_panel",
  ARTIFACT: "artifact_panel",
} as const

const DEFAULT_LAYOUT_VALUES: WorkspaceLayoutCookieData = {
  panels: { [PANEL_IDS.MENU]: false },
  sizes: [0, 100],
}

const WorkspaceLayout = ({
  children,
  defaultValues = DEFAULT_LAYOUT_VALUES,
  menuSlot,
  headerSlot,
  artifactSlot,
}: {
  children: React.ReactNode
  defaultValues?: WorkspaceLayoutCookieData
  menuSlot: React.ReactNode
  headerSlot: React.ReactNode
  artifactSlot?: React.ReactNode
}) => {
  const isMobile = useIsMobile()

  const handleOnPanelChange = (panels: Record<string, boolean>) => {
    // The artifact panel's state is not persisted in the cookie.
    // It will only be displayed based on the user's interaction.
    if (Object.keys(panels).includes(PANEL_IDS.ARTIFACT)) return

    updateWorkspaceLayoutCookie({ panels })
  }

  return (
    <ResizableLayoutProvider defaultPanels={defaultValues.panels} onPanelChange={handleOnPanelChange}>
      <Layout>
        {/*
          We don’t just hide components with CSS,
          we also remove them from the DOM to avoid unnecessary re-renders.
          The same logic applies to all screen size–based conditional renderings below.
        */}
        {!isMobile && (
          <LayoutSidebar>
            {SIDEBAR_NAV_ITEMS.map((item) => (
              <ResizableLayoutOpen panelId={PANEL_IDS.MENU} asChild key={item.id}>
                <LayoutSidebarItem tooltip={item.tooltip} href={item.href} icon={item.icon} title={item.title} />
              </ResizableLayoutOpen>
            ))}
          </LayoutSidebar>
        )}
        <LayoutContentWrapper>
          <LayoutContent>
            <ResizableLayoutGroup direction="horizontal">
              <ResizableLayoutContent defaultSize={100} minSize={50} maxSize={100} className="resizable-layout-content">
                <ResizableLayoutGroup
                  onLayoutChange={(sizes) => updateWorkspaceLayoutCookie({ sizes })}
                  direction="horizontal"
                  className="[&:not(:has(.resizable-layout-panel[data-resizing=true]))_.resizable-layout-content]:transition-[flex]">
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
                      <LayoutDrawer>
                        {isMobile && (
                          <>
                            <LayoutDrawerLinks />
                            {menuSlot}
                          </>
                        )}
                      </LayoutDrawer>
                      {headerSlot}
                    </div>

                    {children}
                  </ResizableLayoutContent>
                </ResizableLayoutGroup>
              </ResizableLayoutContent>

              <ArtifactPanel className="hidden md:block">{!isMobile && artifactSlot}</ArtifactPanel>
            </ResizableLayoutGroup>
          </LayoutContent>
        </LayoutContentWrapper>
      </Layout>
    </ResizableLayoutProvider>
  )
}

const LayoutDrawerLinks = () => {
  const pathname = usePathname().split("/").filter(Boolean)[0] || ""

  return (
    <div className="flex w-full flex-row items-stretch sm:items-center">
      {SIDEBAR_NAV_ITEMS.map((item) => (
        <Link
          data-state={`/${pathname}` === item.href ? "active" : "inactive"}
          href={item.href}
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 border-b px-3 text-sm font-normal leading-none text-secondary-foreground outline-none duration-300 ease-in-out hover:bg-secondary focus-visible:bg-secondary active:bg-secondary/70 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-b-2 data-[state=active]:border-b-border-primary data-[state=active]:font-medium data-[state=active]:text-primary-emphasis data-[state=active]:hover:bg-transparent data-[state=active]:hover:text-primary-emphasis"
          key={item.id}>
          <item.icon />
          <span className="text-xs">{item.title}</span>
        </Link>
      ))}
    </div>
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

export { WorkspaceLayout, PANEL_IDS, ArtifactPanel }

/* -------------------------------------------------------------------------- */
