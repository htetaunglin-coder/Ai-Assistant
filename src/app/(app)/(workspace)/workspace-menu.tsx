"use client"

import { Suspense, lazy } from "react"
import { usePathname } from "next/navigation"
import { ErrorBoundary } from "react-error-boundary"
import { Spinner } from "@/components/ui/spinner"

const menuViews = {
  chat: {
    component: lazy(
      async () =>
        await import("@/features/conversations/conversations-list").then((module) => ({
          default: module.ConversationsList,
        })),
    ),
  },
  agents: {
    component: lazy(() =>
      import("@/features/agents/agents-list").then((module) => ({
        default: module.AgentsList,
      })),
    ),
  },
} as const

type MenuName = keyof typeof menuViews

const WorkspaceMenu = () => {
  const pathname = usePathname().split("/").filter(Boolean)[0] as MenuName | undefined
  const activeView = pathname ? menuViews[pathname] : undefined

  if (!activeView) return null

  const Component = activeView.component

  return (
    <ErrorBoundary
      fallback={
        <div className="size-full pt-20">
          <div className="px-6 text-sm text-danger-emphasis">Something went wrong! Please try refreshing the page.</div>
        </div>
      }>
      <Suspense
        fallback={
          <div className="flex size-full items-center justify-center">
            <Spinner size={40} color="hsl(var(--mijnui-foreground))" strokeWidth={3} />
          </div>
        }>
        <Component />
      </Suspense>
    </ErrorBoundary>
  )
}

export { WorkspaceMenu }
