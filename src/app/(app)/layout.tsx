import { getServerSideResizableLayoutCookieData } from "@/features/app-shell/components/resizable-layout/server-utils"

import { PANEL_IDS } from "@/features/app-shell/panel/constants"
import { UserProfile } from "@/features/auth/components/user-profile"
import { AuthStoreProvider } from "@/features/auth/stores/auth-store-provider"

import { getCurrentUser } from "@/lib/auth"
import { getCookie } from "@/lib/cookies"

import AppShellLayout from "@/features/app-shell/app-shell-layout"
import React from "react"

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

  const { states, sizes } = await getServerSideResizableLayoutCookieData({
    states: { [PANEL_IDS.LEFT]: !!initialPanelView },
    sizes: [0, 100],
  })

  const user = await getCurrentUser()

  const userInitialState = {
    user: user && TEMP_USER_INFO_UNTIL_AUTH_READY,
    isAuthenticated: !!user,
    isLoading: false,
  }

  return (
    <AuthStoreProvider initialState={userInitialState}>
      <AppShellLayout initialPanelView={initialPanelView} initialState={states} defaultLayout={sizes}>
        <div className="absolute inset-x-0 top-4 z-50 flex h-[var(--header-height)] w-full items-center justify-end bg-transparent px-6">
          <UserProfile />
        </div>
        {children}
      </AppShellLayout>
    </AuthStoreProvider>
  )
}
