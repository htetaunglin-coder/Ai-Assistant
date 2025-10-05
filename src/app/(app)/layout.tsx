import React from "react"
import { UserProfile } from "@/features/auth/components/user-profile"
import { AuthStoreProvider } from "@/features/auth/stores/auth-store-provider"
import { MenuView } from "@/features/menu/menu-view"
import { authServer } from "@/lib/auth"
import { AppLayout as AppLayoutComponent } from "@/components/app-layout/app-layout"
import { getServerSideAppLayoutCookieData } from "@/components/app-layout/utils/cookies/server"

const TEMP_USER_INFO_UNTIL_AUTH_READY = {
  id: "1",
  username: "Htet Aung Lin",
  email: "htetaunglin.coder@gmail.com",
  gender: "male",
  image: "/images/avatar.jpg",
  role: "frontend-developer",
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await authServer.getCurrentUser()
  const defaultValues = await getServerSideAppLayoutCookieData()

  const userInitialState = {
    user: user && TEMP_USER_INFO_UNTIL_AUTH_READY,
    isAuthenticated: !!user,
    isLoading: false,
  }

  return (
    <AuthStoreProvider initialState={userInitialState}>
      <AppLayoutComponent
        defaultValues={defaultValues}
        headerSlot={<UserProfile />}
        menuSlot={<MenuView />}
        // Artifact feature is not ready yet.
        // I tested different ways to make this work:
        // - Parallel routes: caused duplicate context providers
        // - Adding AppLayout to each route: same issue with contexts
        // The working solution is to split the state into two stores:
        // - Chat store: holds the artifact data
        // - Artifact UI store: controls if the panel is open or closed
        // artifactSlot={<Artifact />}
      >
        {children}
      </AppLayoutComponent>
    </AuthStoreProvider>
  )
}
