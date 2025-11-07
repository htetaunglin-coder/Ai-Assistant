"use client"

import React, { Suspense } from "react"
import Link from "next/link"
import { Button } from "@mijn-ui/react"
import { PanelLeftClose, X } from "lucide-react"
import { useIsMobile } from "@/hooks/use-screen-sizes"
import {
  ResizableLayoutClose,
  ResizableLayoutContent,
  ResizableLayoutGroup,
  ResizableLayoutOpen,
  ResizableLayoutPanel,
  ResizableLayoutProvider,
} from "@/components/resizable-layout"
import { Tooltip } from "@/components/tooltip-wrapper"
import { SIDEBAR_NAV_ITEMS, SidebarNavItem } from "../constants"
import {
  Layout,
  LayoutContent,
  LayoutContentWrapper,
  LayoutHeader,
  LayoutMobileDrawer,
  LayoutSidebar,
  LayoutSidebarItem,
  usePreservedLayoutPath,
} from "../layout"
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
          We don't just hide components with CSS; we also remove them from the DOM.
          This helps avoid unnecessary re-renders and improves performance.

          The same idea applies to all cases where we show or hide components based on screen size.

          This is important because `isMobile` is a client-side media query hook. 
          If we only use the hook without also hiding elements with CSS, 
          there will be a layout shift during server-side rendering (SSR) until the page finishes loading (hydration).
        */}
        {!isMobile && (
          <LayoutSidebar className="hidden md:block">
            {SIDEBAR_NAV_ITEMS.map((item) => (
              <ResizableLayoutOpen panelId={PANEL_IDS.MENU} key={item.id}>
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
                      <Tooltip content="Close Panel">
                        <Button
                          variant="ghost"
                          iconOnly
                          className="absolute right-4 top-4 z-10 size-10 text-secondary-foreground opacity-0 hover:bg-muted hover:text-foreground group-data-[state=open]/menu-panel:opacity-100">
                          <PanelLeftClose className="!size-5" />
                          <span className="sr-only">Close Panel</span>
                        </Button>
                      </Tooltip>
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
                    <LayoutHeader>
                      <LayoutMobileDrawer>
                        <div className="h-[70svh]">
                          <div className="flex w-full flex-row items-stretch sm:items-center">
                            <Suspense>
                              {SIDEBAR_NAV_ITEMS.map((item) => (
                                <LayoutMobileDrawerLink key={item.id} {...item} />
                              ))}
                            </Suspense>
                          </div>
                          {menuSlot}
                        </div>
                      </LayoutMobileDrawer>

                      {headerSlot}
                    </LayoutHeader>

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

const LayoutMobileDrawerLink = ({ href, icon: Icon, title }: Pick<SidebarNavItem, "href" | "icon" | "title">) => {
  const { hrefToUse, isActive } = usePreservedLayoutPath(href)

  return (
    <Link
      data-state={isActive ? "active" : "inactive"}
      href={hrefToUse}
      className="inline-flex h-9 w-full items-center justify-center gap-1.5 border-b px-3 text-sm font-normal leading-none text-secondary-foreground outline-none duration-300 ease-in-out hover:bg-secondary focus-visible:bg-secondary active:bg-secondary/70 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-b-2 data-[state=active]:border-b-border-primary data-[state=active]:font-medium data-[state=active]:text-primary-emphasis data-[state=active]:hover:bg-transparent data-[state=active]:hover:text-primary-emphasis">
      <Icon />
      <span className="text-xs">{title}</span>
    </Link>
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

export { ArtifactPanel, PANEL_IDS, WorkspaceLayout }

/* -------------------------------------------------------------------------- */
