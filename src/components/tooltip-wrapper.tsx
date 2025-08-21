"use client"

import React from "react"
import {
  type TooltipContentProps,
  TooltipPortal,
  Tooltip as TooltipRoot,
  TooltipTrigger,
} from "@radix-ui/react-tooltip"
import { TooltipContent } from "./ui/tooltip"

type TooltipOptions = Pick<
  TooltipContentProps,
  "side" | "align" | "sideOffset" | "alignOffset" | "avoidCollisions" | "collisionBoundary" | "collisionPadding"
>

type TooltipProps = {
  portal?: boolean
  content: React.ReactNode
  children: React.ReactNode
  options?: TooltipOptions
}

const Tooltip = React.forwardRef<React.ElementRef<typeof TooltipTrigger>, TooltipProps>(
  ({ children, content, portal = false, options, ...triggerProps }, ref) => {
    const Wrapper = portal ? TooltipPortal : React.Fragment

    return (
      <TooltipRoot>
        <TooltipTrigger ref={ref} asChild={true} {...triggerProps}>
          {children}
        </TooltipTrigger>
        <Wrapper>
          <TooltipContent side={"right"} align={"center"} {...options}>
            {content}
          </TooltipContent>
        </Wrapper>
      </TooltipRoot>
    )
  },
)

Tooltip.displayName = "Tooltip"

export { Tooltip }
