"use client"

import { Suspense, lazy } from "react"
import { usePathname } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"

const menuViews = {
  chat: {
    component: lazy(() => import("@/features/conversations/conversations-list")),
  },
  agents: {
    component: lazy(() => import("@/features/agents/agents-view")),
  },
} as const

type MenuName = keyof typeof menuViews

const WorkspaceMenu = () => {
  const pathname = usePathname().split("/").filter(Boolean)[0] as MenuName | undefined
  const activeView = pathname ? menuViews[pathname] : undefined

  if (!activeView) return null

  const Component = activeView.component

  return (
    <Suspense
      fallback={
        <div className="flex size-full items-center justify-center">
          <Spinner size={40} color="hsl(var(--mijnui-foreground))" strokeWidth={3} />
        </div>
      }>
      <Component />
    </Suspense>
  )
}

export { WorkspaceMenu }
