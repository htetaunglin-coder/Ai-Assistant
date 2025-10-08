import React from "react"
import { UserProfile } from "@/features/auth/components/user-profile"
import { MenuView } from "@/features/menu/menu-view"
import { getServerSideWorkspaceLayoutCookieData } from "@/components/layout/workspace"
import { WorkspaceLayout } from "@/components/layout/workspace"

export default async function Workspace({ children }: { children: React.ReactNode }) {
  const defaultValues = await getServerSideWorkspaceLayoutCookieData()

  return (
    <WorkspaceLayout
      defaultValues={defaultValues}
      headerSlot={<UserProfile />}
      menuSlot={<MenuView />}
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
