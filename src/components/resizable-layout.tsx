"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { createContext } from "@/utils/create-context"
import { cn } from "@mijn-ui/react"
import { Button } from "@mijn-ui/react"
import { Slot } from "@radix-ui/react-slot"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { ImperativePanelHandle } from "react-resizable-panels"
import { useControllableState } from "@/hooks/use-controlled-state"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

/* -------------------------------------------------------------------------- */
/*                           ResizableLayoutContext                           */
/* -------------------------------------------------------------------------- */

type ResizableLayoutPanelState = {
  [id: string]: boolean
}

type ResizableLayoutContextType = {
  panels: ResizableLayoutPanelState | undefined
  togglePanel: (id: string) => void
  openPanel: (id: string) => void
  closePanel: (id: string) => void
  isResizing: boolean
  setIsResizing: (isResizing: boolean) => void
}

const [ResizableLayoutContextProvider, useResizableLayoutContext] = createContext<ResizableLayoutContextType>({
  name: "ResizableLayoutContext",
  strict: true,
  errorMessage:
    "useResizableLayoutContext: `context` is undefined. Ensure the component is wrapped within <ResizableLayoutProvider />",
})

/* -------------------------------------------------------------------------- */
/*                           ResizableLayoutProvider                          */
/* -------------------------------------------------------------------------- */

export type ResizableLayoutProviderProps = {
  panels?: ResizableLayoutPanelState
  defaultPanels?: ResizableLayoutPanelState
  onPanelChange?: (panels: ResizableLayoutPanelState) => void
  children: React.ReactNode
}

const ResizableLayoutProvider = ({
  panels: controlledPanels,
  defaultPanels = {},
  onPanelChange,
  children,
}: ResizableLayoutProviderProps) => {
  const [panels, setPanels] = useControllableState({
    prop: controlledPanels,
    defaultProp: defaultPanels,
    onChange: onPanelChange,
  })
  const [isResizing, setIsResizing] = useState(false)

  const setPanelState = useCallback(
    (id: string, isOpen: boolean) => {
      const newState = { ...panels, [id]: isOpen }
      setPanels(newState)
    },
    [panels, setPanels],
  )

  const togglePanel = useCallback(
    (id: string) => {
      if (panels) setPanelState(id, panels[id])
    },
    [panels, setPanelState],
  )

  const openPanel = useCallback(
    (id: string) => {
      setPanelState(id, true)
    },
    [setPanelState],
  )

  const closePanel = useCallback(
    (id: string) => {
      setPanelState(id, false)
    },
    [setPanelState],
  )

  return (
    <ResizableLayoutContextProvider value={{ isResizing, setIsResizing, panels, togglePanel, openPanel, closePanel }}>
      {children}
    </ResizableLayoutContextProvider>
  )
}
/* -------------------------------------------------------------------------- */
/*                            ResizableLayoutGroup                            */
/* -------------------------------------------------------------------------- */

// Renamed `onLayout` to `onLayoutChange` for consistency and clarity across the codebase.
export type ResizableLayoutGroupProps = Omit<React.ComponentProps<typeof ResizablePanelGroup>, "onLayout"> & {
  onLayoutChange?: (sizes: number[]) => void
}

const ResizableLayoutGroup = ({ children, onLayoutChange, ...props }: ResizableLayoutGroupProps) => {
  const handleOnLayout = (sizes: number[]) => {
    onLayoutChange?.(sizes)
  }

  return (
    <ResizablePanelGroup onLayout={handleOnLayout} {...props}>
      {children}
    </ResizablePanelGroup>
  )
}

/* -------------------------------------------------------------------------- */
/*                            ResizableLayoutPanel                            */
/* -------------------------------------------------------------------------- */

export type ResizableLayoutPanelProps = {
  panelId: string
  minSize?: number
  side: "left" | "right"
  collapseOnResize?: boolean
  disableTransition?: boolean
} & React.ComponentProps<typeof ResizablePanel>

const ResizableLayoutPanel = ({
  panelId,
  className,
  children,
  minSize = 20,
  defaultSize = 25,
  maxSize = 30,
  side,
  collapseOnResize = false,
  disableTransition = false,
  ...props
}: ResizableLayoutPanelProps) => {
  const { panels, openPanel, closePanel } = useResizableLayoutContext()

  const panelRef = useRef<ImperativePanelHandle>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [isKeyResizing, setIsKeyResizing] = useState(false)

  const isOpen = (panels && panels[panelId]) ?? false

  useEffect(() => {
    const panel = panelRef.current

    if (!panel) return

    if (isOpen && panel.isCollapsed()) {
      panel.expand()
    } else if (!isOpen && !panel.isCollapsed()) {
      panel.collapse()
    }
  }, [isOpen])

  const onHandleFocus = () => {
    setIsKeyResizing(true)
  }
  const onHandleBlur = () => {
    setIsKeyResizing(false)
  }

  const resizableHandle = (
    <ResizableHandle
      hitAreaMargins={{ coarse: 20, fine: 5 }}
      className={cn(
        "pointer-events-none relative hidden w-6 bg-transparent p-0 after:absolute after:right-0 after:top-1/2 after:h-8 after:w-[6px] after:-translate-y-1/2 after:rounded-full after:bg-border after:transition-all after:hover:h-10",
        isOpen && "hidden aria-[valuenow=0]:hidden md:block",
        side === "left" ? "-ml-1.5 translate-x-0.5" : "-mr-1.5 -translate-x-0.5",
      )}
      onFocus={onHandleFocus}
      onBlur={onHandleBlur}
      onDragging={(isResizing) => {
        setIsResizing(isResizing)
      }}
    />
  )

  const handleResize = (size: number) => {
    // Prevent collapsing below minSize unless intended
    if (size < minSize && panelRef.current && (isResizing || isKeyResizing) && !collapseOnResize) {
      panelRef.current.resize(minSize)
    }
  }

  return (
    <>
      {side === "right" && resizableHandle}
      <ResizablePanel
        ref={panelRef}
        className={cn(
          isOpen && side === "right" && "border-l",
          isOpen && side === "left" && "border-r",
          !disableTransition && !isResizing && "transition-[flex] duration-300 ease-in-out",
          className,
        )}
        minSize={minSize}
        defaultSize={defaultSize}
        maxSize={maxSize}
        collapsible
        onResize={handleResize}
        onCollapse={() => {
          if (collapseOnResize && isOpen) closePanel(panelId)
        }}
        onExpand={() => {
          if (collapseOnResize && !isOpen) openPanel(panelId)
        }}
        data-resizing={isResizing ? "true" : "false"}
        data-state={isOpen ? "open" : "closed"}
        {...props}>
        {children}
      </ResizablePanel>
      {side === "left" && resizableHandle}
    </>
  )
}

ResizableLayoutPanel.displayName = "ResizableLayoutPanel"

/* -------------------------------------------------------------------------- */
/*                           ResizableLayoutContent                           */
/* -------------------------------------------------------------------------- */

export type ResizableLayoutContentProps = React.ComponentProps<typeof ResizablePanel> & {}

const ResizableLayoutContent = ({
  defaultSize = 75,
  minSize = 70,
  maxSize = 100,
  className,
  ...props
}: ResizableLayoutContentProps) => {
  return (
    <ResizablePanel
      defaultSize={defaultSize}
      minSize={minSize}
      maxSize={maxSize}
      className={cn("", className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                           ResizableLayoutTrigger                           */
/* -------------------------------------------------------------------------- */

export type ResizableLayoutTriggerProps = {
  panelId: string
} & React.ComponentProps<typeof Button>

const ResizableLayoutTrigger = ({ panelId, onClick, children, ...props }: ResizableLayoutTriggerProps) => {
  const { panels, togglePanel } = useResizableLayoutContext()
  const isOpen = (panels && panels[panelId]) ?? false
  const buttonContent = isOpen ? <PanelLeftClose /> : <PanelLeftOpen />

  return (
    <Button
      onClick={(e) => {
        onClick?.(e)
        togglePanel(panelId)
      }}
      iconOnly
      data-state={isOpen ? "open" : "closed"}
      {...props}>
      {children ? children : buttonContent}
    </Button>
  )
}

/* -------------------------------------------------------------------------- */
/*                      ResizableLayoutOpen / Close                           */
/* -------------------------------------------------------------------------- */

export type ResizableLayoutActionProps = {
  panelId: string
  asChild?: boolean
} & React.ComponentProps<"button">

const ResizableLayoutOpen = ({ panelId, onClick, asChild = false, ...props }: ResizableLayoutActionProps) => {
  const Comp = asChild ? Slot : "button"
  const { openPanel } = useResizableLayoutContext()

  return (
    <Comp
      onClick={(e) => {
        onClick?.(e)
        openPanel(panelId)
      }}
      {...props}
    />
  )
}

const ResizableLayoutClose = ({ panelId, onClick, asChild, ...props }: ResizableLayoutActionProps) => {
  const Comp = asChild ? Slot : "button"
  const { closePanel } = useResizableLayoutContext()

  return (
    <Comp
      onClick={(e) => {
        onClick?.(e)
        closePanel(panelId)
      }}
      {...props}
    />
  )
}

export {
  ResizableLayoutClose,
  ResizableLayoutContent,
  ResizableLayoutGroup,
  ResizableLayoutOpen,
  ResizableLayoutPanel,
  ResizableLayoutProvider,
  ResizableLayoutTrigger,
  useResizableLayoutContext,
}
