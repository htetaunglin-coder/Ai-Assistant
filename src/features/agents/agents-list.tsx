"use client"

import Link from "next/link"
import { Button } from "@mijn-ui/react"
import { Plus } from "lucide-react"
import { LayoutMobileDrawerClose } from "@/components/layout/layout"
import {
  WorkspaceLayoutPanelContainer,
  WorkspaceLayoutPanelContent,
  WorkspaceLayoutPanelHeader,
  WorkspaceLayoutPanelTitle,
} from "@/components/layout/workspace/workspace"
import { useAgents } from "./api/queries"

const AgentsList = () => {
  const { data, isLoading, isError } = useAgents()

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 w-full animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      )
    }

    if (isError) {
      return (
        <div className="px-4 text-sm text-danger-emphasis">Something went wrong! Please try refreshing the page.</div>
      )
    }

    if (!data || data?.length === 0) {
      return <div className="p-2 text-sm text-secondary-foreground/70">{"No agents yet."}</div>
    }

    return (
      <ul>
        {data.map((agent) => (
          <li key={agent.id} className="text-sm">
            <Button
              asChild
              variant="ghost"
              className="group relative h-14 w-full justify-start gap-2 truncate text-sm text-secondary-foreground hover:bg-muted hover:text-foreground">
              <Link href={`/agents/${agent.id}`}>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted transition duration-300 group-hover:bg-secondary">
                  <agent.icon />
                </span>
                <div className="w-full truncate">
                  <p className="truncate text-sm font-medium">{agent.name}</p>
                  <p className="truncate text-xs text-secondary-foreground">{agent.description}</p>
                </div>
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <WorkspaceLayoutPanelContainer>
      <WorkspaceLayoutPanelHeader>
        <WorkspaceLayoutPanelTitle>AI Agents</WorkspaceLayoutPanelTitle>
      </WorkspaceLayoutPanelHeader>
      <div className="my-2 px-4 md:mt-0">
        <LayoutMobileDrawerClose asChild>
          <Button variant="default" asChild className="w-full justify-between text-secondary-foreground">
            <Link href="/agents" className="truncate">
              <span className="truncate">Create New Agent</span>
              <Plus className="size-4 shrink-0" />
            </Link>
          </Button>
        </LayoutMobileDrawerClose>
      </div>

      <WorkspaceLayoutPanelContent className="lg:px-2">{renderContent()}</WorkspaceLayoutPanelContent>
    </WorkspaceLayoutPanelContainer>
  )
}

export { AgentsList }
