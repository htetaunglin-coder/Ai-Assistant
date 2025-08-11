"use client"

import * as React from "react"
import { Button, ButtonProps } from "@mijn-ui/react"
import { Check, Copy } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type CopyButtonProps = {
  text: string
  className?: string
} & ButtonProps

export function CopyButton({ text, ...props }: CopyButtonProps) {
  const [isCopied, setIsCopied] = React.useState(false)

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)

      setTimeout(() => {
        setIsCopied(false)
      }, 1500)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }, [text])

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            iconOnly
            aria-label={isCopied ? "Copied" : "Copy to clipboard"}
            onClick={handleCopy}
            disabled={isCopied}
            {...props}>
            {isCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="px-2 py-1 text-xs">
          {isCopied ? "Copied!" : "Copy"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
