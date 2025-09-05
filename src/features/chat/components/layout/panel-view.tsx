"use client"

import React, { useCallback, useState } from "react"
import { createContext } from "@/utils/create-context"
import { Slot } from "@radix-ui/react-slot"
import { PanelViewType } from "./constants"
import { updateChatLayoutCookie } from "./utils/cookies/client"

type PanelViewProviderContextType = {
  activePanelView: string | null
  setActivePanelView: (panel: PanelViewType | null) => void
}

const [PanelViewContextProvider, usePanelViewContext] = createContext<PanelViewProviderContextType>({
  name: "PanelViewContext",
  strict: true,
})

export type PanelViewProviderProps = {
  defaultActiveView: PanelViewType | null
  children: React.ReactNode
}

const PanelViewProvider = ({ defaultActiveView, children }: PanelViewProviderProps) => {
  const [activePanelView, setActivePanelView] = useState<PanelViewType | null>(defaultActiveView)

  const handleSetActivePanel = useCallback((panel: PanelViewType | null) => {
    setActivePanelView(panel)
    updateChatLayoutCookie({ activeView: panel })
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

/* -------------------------------------------------------------------------- */

const PanelViewContent = ({ value, ...props }: React.ComponentProps<"div"> & { value: PanelViewType }) => {
  const { activePanelView } = usePanelViewContext()

  if (activePanelView !== value) return null

  return <div {...props} />
}

export { PanelViewProvider, PanelViewTrigger, PanelViewContent, usePanelViewContext }
