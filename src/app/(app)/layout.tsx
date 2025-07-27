import { getServerSideResizableLayoutCookieData } from "@/components/resizable-layout/server-utils"

import { AuthStoreProvider } from "@/features/auth/stores/auth-store-provider"

import { getCurrentUser } from "@/lib/auth"
import { getCookie } from "@/lib/cookies"

import AppShellLayout from "@/features/app-shell/app-shell-layout"
import React from "react"
import { UserProfile } from "@/features/auth/components/user-profile"
import { PanelViewType } from "@/features/app-shell/constants"

// Temporary fallback user info for MVP only
const TEMP_USER_INFO_UNTIL_AUTH_READY = {
  id: "1",
  username: "Htet Aung Lin",
  email: "htetaunglin.coder@gmail.com",
  gender: "male",
  image: "/images/avatar.jpg",
  role: "frontend-developer",
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const initialPanelView = (await getCookie("chat_panel_active_view")) || null

  const { states, sizes } = await getServerSideResizableLayoutCookieData()

  const user = await getCurrentUser()

  const userInitialState = {
    user: user && TEMP_USER_INFO_UNTIL_AUTH_READY,
    isAuthenticated: !!user,
    isLoading: false,
  }

  return (
    <AuthStoreProvider initialState={userInitialState}>
      <AppShellLayout
        initialPanelView={initialPanelView as PanelViewType}
        initialState={states}
        defaultLayout={sizes}
        renderUser={<UserProfile user={user} />}>
        {children}
      </AppShellLayout>
    </AuthStoreProvider>
  )
}
