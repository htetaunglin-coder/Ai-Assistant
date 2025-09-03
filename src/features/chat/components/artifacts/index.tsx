"use client"

import React from "react"
import { Button } from "@mijn-ui/react"
import { FileX, RefreshCw } from "lucide-react"
import { useChatStore } from "../../stores/chat-store-provider"
import { CodeBlock, CodeBlockContent } from "../ui/code-block-2"

const Artifact = () => {
  const artifact = useChatStore((state) => state.artifact)

  if (!artifact || !artifact.content)
    return (
      <div className="flex size-full flex-col items-center justify-center overflow-hidden px-4 text-center">
        <div className="flex min-w-96 flex-col items-center justify-center">
          <div className="mb-6 rounded-full bg-muted p-4">
            <FileX className="size-8 text-danger-emphasis" />
          </div>

          <h3 className="mb-2 text-2xl font-semibold text-foreground">Artifact Not Found!</h3>

          <p className="mb-8 max-w-md text-balance text-muted-foreground">
            The requested artifact could not be located. It may have been moved, deleted, or never existed.
          </p>

          <div className="flex gap-3">
            <Button onClick={() => alert("retry!")} className="flex items-center gap-2 bg-transparent">
              <RefreshCw className="size-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )

  return (
    <div
      className="flex size-full flex-col"
      style={
        {
          "--artifact-header-height": "4rem",
          "--code-block-padding": "1rem",
        } as React.CSSProperties
      }>
      ``
      <div className="sticky top-0 h-[var(--artifact-header-height)] w-full bg-muted"></div>
      <CodeBlock className="h-fit border-none py-[var-(--code-block-padding)] [&_.code-block-content]:!bg-transparent">
        <CodeBlockContent
          code={artifact?.content || ""}
          language="html"
          className="h-[calc(100svh-var(--main-area-padding)-var(--artifact-header-height)-var(--code-block-padding))] dark:[&_.shiki]:!bg-transparent"
        />
      </CodeBlock>
    </div>
  )
}

export { Artifact }
