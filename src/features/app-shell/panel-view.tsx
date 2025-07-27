"use client"

import { createContext } from "@/utils/create-context"
import React, { useCallback, useState } from "react"
import { PanelViewType } from "./constants"
import { Slot } from "@radix-ui/react-slot"

const CHAT_PANEL_COOKIE_NAME = "chat_panel_active_view"
const CHAT_PANEL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

type PanelContextType = {
  activePanelView: string | null
  setActivePanelView: (panel: PanelViewType | null) => void
}

const [PanelViewContextProvider, usePanelViewContext] = createContext<PanelContextType>({
  name: "PanelContext",
  strict: true,
})

export type PanelViewProviderProps = {
  initialPanelView: PanelViewType | null
  children: React.ReactNode
}

const PanelViewProvider = ({ initialPanelView, children }: PanelViewProviderProps) => {
  const [activePanelView, setActivePanelView] = useState<PanelViewType | null>(initialPanelView)

  const handleSetActivePanel = useCallback((panel: PanelViewType | null) => {
    setActivePanelView(panel)
    if (typeof document !== "undefined") {
      document.cookie = `${CHAT_PANEL_COOKIE_NAME}=${panel || ""}; path=/; max-age=${CHAT_PANEL_COOKIE_MAX_AGE};`
    }
  }, [])

  return (
    <PanelViewContextProvider
      value={{
        activePanelView,
        setActivePanelView: handleSetActivePanel,
      }}>
      {children}
    </PanelViewContextProvider>
  )
}

/* -------------------------------------------------------------------------- */

const PanelViewTrigger = ({
  asChild,
  onClick,
  value,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean; value: PanelViewType }) => {
  const Comp = asChild ? Slot : "button"

  const { activePanelView, setActivePanelView } = usePanelViewContext()

  return (
    <Comp
      onClick={(e) => {
        onClick?.(e)
        setActivePanelView(value)
      }}
      data-state={activePanelView === value ? "active" : "inactive"}
      {...props}
    />
  )
}

const PanelViewContent = ({ value, ...props }: React.ComponentProps<"div"> & { value: PanelViewType }) => {
  const { activePanelView } = usePanelViewContext()

  if (activePanelView !== value) return null

  return <div {...props} />
}

export { PanelViewProvider, usePanelViewContext, PanelViewTrigger, PanelViewContent }
