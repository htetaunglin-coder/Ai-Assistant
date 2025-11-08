"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@mijn-ui/react"
import { Plus } from "lucide-react"
import { LayoutMobileDrawerClose } from "@/components/layout/layout"
import {
  WorkspaceLayoutPanelContainer,
  WorkspaceLayoutPanelContent,
  WorkspaceLayoutPanelHeader,
  WorkspaceLayoutPanelTitle,
} from "@/components/layout/workspace/workspace"
import { useAgentList } from "./api/queries"
import { AgentIcon, AgentIconName } from "./components/agent-icon"
import { Agent } from "./types"

const AgentsList = () => {
  const { data: agents, isLoading, isError } = useAgentList()

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

    if (!agents || agents.data?.length === 0) {
      return <div className="p-2 text-sm text-secondary-foreground/70">{"No agents yet."}</div>
    }

    return (
      <ul>
        {agents.data.map((agent) => (
          <li key={agent.id} className="text-sm">
            <AgentsListItem agent={agent} />
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

const AgentsListItem = ({ agent }: { agent: Agent }) => {
  const pathname = usePathname()
  const href = `/agents/${agent.id}`

  return (
    <Button
      asChild
      variant="ghost"
      data-state={pathname === href ? "active" : "inactive"}
      className="group relative h-14 w-full justify-start gap-2 truncate text-sm text-secondary-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-muted">
      <Link href={`/agents/${agent.id}`}>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted transition duration-300 group-hover:bg-secondary group-data-[state=active]:bg-secondary">
          <AgentIcon icon={agent.icon as AgentIconName} />
        </span>
        <div className="w-full truncate">
          <p className="truncate text-sm font-medium">{agent.name}</p>
          <p className="truncate text-xs text-secondary-foreground">{agent.description}</p>
        </div>
      </Link>
    </Button>
  )
}
