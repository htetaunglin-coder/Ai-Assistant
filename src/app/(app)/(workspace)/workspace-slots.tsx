"use client"

import { type ComponentType, JSX, Suspense, lazy } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserProfile } from "@/features/auth/components/user-profile"
import { Button } from "@mijn-ui/react"
import { Edit } from "lucide-react"
import { ErrorBoundary } from "react-error-boundary"
import { Spinner } from "@/components/ui/spinner"

type MenuRoute = "chat" | "agents"

interface RouteConfig<T = ComponentType> {
  component: T
}

const MENU_VIEWS: Record<MenuRoute, RouteConfig> = {
  chat: {
    component: lazy(() =>
      import("@/features/conversations/conversations-list").then((m) => ({
        default: m.ConversationsList,
      })),
    ),
  },
  agents: {
    component: lazy(() =>
      import("@/features/agents/agents-list").then((m) => ({
        default: m.AgentsList,
      })),
    ),
  },
} as const

const HEADER_VIEWS: Record<MenuRoute, RouteConfig<JSX.Element>> = {
  chat: {
    component: (
      <Button asChild variant="ghost" className="items-center gap-2 text-secondary-foreground">
        <Link href="/chat">
          New Chat
          <Edit className="mt-0.5 size-4 shrink-0" />
        </Link>
      </Button>
    ),
  },
  agents: {
    component: <></>,
  },
} as const

/* -------------------------------------------------------------------------- */

export const WorkspaceMenu = () => {
  const activeRoute = useActiveRoute()

  if (!activeRoute) return null

  const Component = MENU_VIEWS[activeRoute].component

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingFallback />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  )
}

export const WorkspaceHeader = () => {
  const activeRoute = useActiveRoute()

  if (!activeRoute) return null

  const content = HEADER_VIEWS[activeRoute].component

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingFallback />}>
        <div className="flex items-center gap-2">
          <div className="md:hidden">{content}</div>
          <UserProfile />
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}

/* -------------------------------------------------------------------------- */

const useActiveRoute = (): MenuRoute | null => {
  const pathname = usePathname()
  const firstSegment = pathname.split("/").filter(Boolean)[0]

  return firstSegment && firstSegment in MENU_VIEWS ? (firstSegment as MenuRoute) : null
}

/* -------------------------------------------------------------------------- */

const LoadingFallback = () => (
  <div className="flex size-full items-center justify-center">
    <Spinner size={40} color="hsl(var(--mijnui-foreground))" strokeWidth={3} />
  </div>
)

const ErrorFallback = () => (
  <div className="size-full pt-20">
    <div className="px-6 text-sm text-danger-emphasis">Something went wrong! Please try refreshing the page.</div>
  </div>
)
