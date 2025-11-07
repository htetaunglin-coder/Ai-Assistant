"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createContext } from "@/utils/create-context"
import { Button, cn } from "@mijn-ui/react"
import { Slot } from "@radix-ui/react-slot"
import { Menu } from "lucide-react"
import { useIsMobile } from "@/hooks/use-screen-sizes"
import { Sidebar, SidebarContent, SidebarIcon, SidebarItem, SidebarProvider, SidebarToggler } from "../sidebar"
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "../ui/drawer"
import { SidebarNavItem } from "./constants"

const Layout = ({
  className,
  style,
  children,
}: {
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) => {
  return (
    <SidebarProvider className="group/sidebar">
      <LayoutMobileDrawerProvider>
        <div
          className={cn("flex h-svh w-full bg-background", className)}
          style={
            {
              "--main-area-padding": "0.5rem",
              "--header-height": "3.5rem",
              ...style,
            } as React.CSSProperties
          }>
          {children}
        </div>
      </LayoutMobileDrawerProvider>
    </SidebarProvider>
  )
}

const LayoutContentWrapper = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        "size-full grow transition-[padding] duration-300 ease-in-out md:p-[var(--main-area-padding)] group-data-[state=open]/sidebar:md:pl-[calc(var(--sidebar-width)_+_var(--main-area-padding))]",
        className,
      )}>
      {children}
    </div>
  )
}

const LayoutContent = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <main className={cn("relative size-full overflow-hidden bg-secondary md:rounded-md", className)}>{children}</main>
  )
}

const LayoutSidebar = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <>
      <Sidebar className={cn("fixed inset-y-0 left-0 z-30 shrink-0 bg-background", className)}>
        <SidebarContent>
          <SidebarIcon asChild>
            <Link
              href="/chat"
              className="flex size-11 items-center justify-center rounded-md !p-1.5"
              aria-label="Picosbs Home">
              <Image src="/images/picosbs.png" width={44} height={44} alt="Picosbs" priority />
            </Link>
          </SidebarIcon>

          {children}
        </SidebarContent>
      </Sidebar>

      <SidebarToggler className="fixed bottom-6 left-6 z-40 hidden bg-background text-lg text-secondary-foreground transition-all duration-300 hover:text-foreground data-[state=open]:bottom-4 data-[state=open]:left-5 sm:block" />
    </>
  )
}
const LayoutSidebarItem = ({
  tooltip,
  href,
  icon: Icon,
  title,
}: Pick<SidebarNavItem, "tooltip" | "title" | "icon" | "href">) => {
  const pathname = usePathname()
  const isActive = pathname.startsWith(href)

  const content = (
    <>
      <SidebarIcon className={cn(isActive ? "bg-muted text-foreground" : "")}>
        <Icon />
      </SidebarIcon>
      <span className="text-xs">{title}</span>
    </>
  )

  return (
    <SidebarItem asChild tooltip={tooltip}>
      {isActive ? (
        <span data-state="active" className="group">
          {content}
        </span>
      ) : (
        <Link href={href} data-state="inactive" className="group">
          {content}
        </Link>
      )}
    </SidebarItem>
  )
}

const LayoutHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="sticky inset-x-0 z-20 flex h-[var(--header-height)] w-full items-center justify-between bg-secondary px-4 md:absolute md:top-4 md:justify-end md:bg-transparent md:px-6">
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
type LayoutMobileDrawerContextType = {
  open: boolean
  setOpen: (open: boolean) => void
}

const [LayoutMobileDrawerContextProvider, useLayoutMobileDrawer] = createContext<LayoutMobileDrawerContextType>({
  name: "LayoutMobileDrawer",
  errorMessage:
    "useLayoutMobileDrawer: `context` is undefined. Ensure the component is wrapped within <LayoutMobileDrawerProvider />",
})

const LayoutMobileDrawerProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false)

  return <LayoutMobileDrawerContextProvider value={{ open, setOpen }}>{children}</LayoutMobileDrawerContextProvider>
}

const LayoutMobileDrawer = ({ children }: { children: React.ReactNode }) => {
  const { open, setOpen } = useLayoutMobileDrawer()
  const isMobile = useIsMobile()

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button iconOnly size="sm" variant="ghost" className="text-xl md:hidden">
          <Menu />
          <span className="sr-only">Open menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="z-50 flex w-full flex-col">
        <DrawerTitle className="sr-only">Navigation Menu</DrawerTitle>
        {isMobile && children}
      </DrawerContent>
    </Drawer>
  )
}

const LayoutMobileDrawerClose = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  const { setOpen } = useLayoutMobileDrawer()
  const isMobile = useIsMobile()
  const Component = asChild ? Slot : "button"

  return <Component onClick={() => isMobile && setOpen(false)}>{children}</Component>
}

const LayoutMobileDrawerOpen = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  const { setOpen } = useLayoutMobileDrawer()
  const isMobile = useIsMobile()
  const Component = asChild ? Slot : "button"

  return <Component onClick={() => isMobile && setOpen(true)}>{children}</Component>
}

export {
  Layout,
  LayoutContent,
  LayoutContentWrapper,
  LayoutHeader,
  LayoutMobileDrawer,
  LayoutMobileDrawerClose,
  LayoutMobileDrawerOpen,
  LayoutSidebar,
  LayoutSidebarItem,
  useLayoutMobileDrawer,
}
