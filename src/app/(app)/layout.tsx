import React from "react"
import { AuthStoreProvider } from "@/features/auth/stores/auth-store-provider"
import { authServerAPI } from "@/lib/auth/server"

const TEMP_USER_INFO_UNTIL_AUTH_READY = {
  id: "1",
  username: "Htet Aung Lin",
  email: "htetaunglin.coder@gmail.com",
  gender: "male",
  image: "/images/avatar.jpg",
  role: "frontend-developer",
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await authServerAPI.getCurrentUser()

  const userInitialState = {
    user: user && TEMP_USER_INFO_UNTIL_AUTH_READY,
    isAuthenticated: !!user,
    isLoading: false,
  }

  return <AuthStoreProvider initialState={userInitialState}>{children}</AuthStoreProvider>
}
