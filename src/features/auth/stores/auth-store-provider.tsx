"use client"

import { type ReactNode, createContext, useContext, useState } from "react"
import { useStore } from "zustand"
import { type AuthState, type AuthStoreState, createAuthStore } from "./auth-store"

export type AuthStoreApi = ReturnType<typeof createAuthStore>

export const AuthStoreContext = createContext<AuthStoreApi | undefined>(undefined)

export interface AuthStoreProviderProps {
  children: ReactNode
  initialState?: Partial<AuthState>
}
export const AuthStoreProvider = ({ children, initialState }: AuthStoreProviderProps) => {
  const [store] = useState(() => createAuthStore(initialState))
  return <AuthStoreContext.Provider value={store}>{children}</AuthStoreContext.Provider>
}

export const useAuthStore = <T,>(selector: (store: AuthStoreState) => T): T => {
  const authStoreContext = useContext(AuthStoreContext)

  if (!authStoreContext) {
    throw new Error(`useAuthStore must be used within AuthStoreProvider`)
  }

  return useStore(authStoreContext, selector)
}
