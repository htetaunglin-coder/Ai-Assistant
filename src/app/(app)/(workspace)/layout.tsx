import React from "react"
import { WorkspaceLayout, getServerSideWorkspaceLayoutCookieData } from "@/components/layout/workspace"
import { WorkspaceHeader, WorkspaceMenu } from "./workspace-slots"

export default async function Workspace({ children }: { children: React.ReactNode }) {
  const defaultValues = await getServerSideWorkspaceLayoutCookieData()

  return (
    <WorkspaceLayout
      defaultValues={defaultValues}
      headerSlot={<WorkspaceHeader />}
      menuSlot={<WorkspaceMenu />}
      // Artifact feature is not ready yet.
      // I tested different ways to make this work:
      // - Parallel routes: caused duplicate context providers
      // - Adding WorkspaceLayout to each route: same issue with contexts
      // The working solution is to split the state into two stores:
      // - Chat store: holds the artifact data
      // - Artifact UI store: controls if the panel is open or closed
      // artifactSlot={<Artifact />}
    >
      {children}
    </WorkspaceLayout>
  )
}
