"use client"

import React, { Suspense } from "react"
import Link from "next/link"
import { UserProfile } from "@/features/auth/components/user-profile"
import { Button } from "@mijn-ui/react"
import { ChevronRight } from "lucide-react"
import { useIsMobile } from "@/hooks/use-screen-sizes"
import { SIDEBAR_NAV_ITEMS } from "./constants"
import {
  Layout,
  LayoutContent,
  LayoutContentWrapper,
  LayoutHeader,
  LayoutMobileDrawer,
  LayoutSidebar,
  LayoutSidebarItem,
} from "./layout"

const DetailsLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile()

  return (
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
          <Suspense>
            {SIDEBAR_NAV_ITEMS.map((item) => (
              <LayoutSidebarItem
                key={item.id}
                tooltip={item.tooltip}
                href={item.href}
                icon={item.icon}
                title={item.title}
              />
            ))}
          </Suspense>
        </LayoutSidebar>
      )}

      <LayoutContentWrapper>
        <LayoutContent className="md:pt-[var(--header-height)]">
          <LayoutHeader>
            <LayoutMobileDrawer>
              <div className="p-4 pb-8">
                {SIDEBAR_NAV_ITEMS.map((item) => (
                  <Button
                    key={item.id}
                    asChild
                    variant="ghost"
                    className="h-14 w-full justify-start gap-2 rounded-none px-4 text-base font-normal">
                    <Link href={item.href}>
                      <item.icon className="shrink-0" />
                      <span className="flex-1">{item.title}</span>
                      <ChevronRight className="shrink-0 text-xl text-muted-foreground" strokeWidth={1.5} />
                    </Link>
                  </Button>
                ))}
              </div>
            </LayoutMobileDrawer>
            <UserProfile />
          </LayoutHeader>
          {children}
        </LayoutContent>
      </LayoutContentWrapper>
    </Layout>
  )
}

export default DetailsLayout
