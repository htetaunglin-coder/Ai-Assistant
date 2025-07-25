"use client"

import { createContext } from "@/utils/create-context"
import React, { useCallback, useState } from "react"

const CHAT_PANEL_COOKIE_NAME = "chat_panel_active_view"
const CHAT_PANEL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

type PanelContextType = {
  activePanelView: string | null
  setActivePanelView: (panel: string | null) => void
}

const [PanelContextProvider, usePanelContext] = createContext<PanelContextType>({
  name: "PanelContext",
  strict: true,
})

export type PanelProviderProps = {
  initialPanelView: string | null
  children: React.ReactNode
}

const PanelProvider = ({ initialPanelView, children }: PanelProviderProps) => {
  const [activePanelView, setActivePanelView] = useState<string | null>(initialPanelView)

  const handleSetActivePanel = useCallback((panel: string | null) => {
    setActivePanelView(panel)
    if (typeof document !== "undefined") {
      document.cookie = `${CHAT_PANEL_COOKIE_NAME}=${panel || ""}; path=/; max-age=${CHAT_PANEL_COOKIE_MAX_AGE};`
    }
  }, [])

  return (
    <PanelContextProvider
      value={{
        activePanelView,
        setActivePanelView: handleSetActivePanel,
      }}>
      {children}
    </PanelContextProvider>
  )
}

export { PanelProvider, usePanelContext }
