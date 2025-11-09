import React from "react"
import { AuthStoreProvider } from "@/features/auth/stores/auth-store-provider"
import { authServerAPI } from "@/lib/auth/server"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const getUser = async () => {
    try {
      const data = await authServerAPI.getCurrentUser()
      return data
    } catch (_) {
      return null
    }
  }
  const user = await getUser()

  const userInitialState = {
    user: user,
    isAuthenticated: !!user,
    isLoading: false,
  }

  return <AuthStoreProvider initialState={userInitialState}>{children}</AuthStoreProvider>
}
