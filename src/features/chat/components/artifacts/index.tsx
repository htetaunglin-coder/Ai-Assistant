"use client"

import React from "react"
import { Button } from "@mijn-ui/react"
import { FileX, RefreshCw } from "lucide-react"
import { CopyButton } from "@/components/ui/copy-button"
import { useChatStore } from "../../stores/chat-store-provider"
import { Markdown } from "../markdown"
import { BundledLanguage, CodeBlock, CodeBlockContent } from "../ui/code-block"

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
      <div className="sticky top-0 flex h-[var(--artifact-header-height)] w-full items-center justify-between bg-muted p-4 pr-14">
        <h3 className="text-base font-medium">{artifact.title}</h3>

        <CopyButton content={artifact.content} className="border-none [&_>svg]:!text-foreground" />
      </div>

      {artifact.name === "code" && (
        <CodeBlock className="h-[calc(100svh-var(--main-area-padding)-var(--artifact-header-height)-var(--code-block-padding))] overflow-auto border-none py-[var-(--code-block-padding)] [&_.code-block-content]:!bg-transparent">
          <CodeBlockContent
            code={artifact.content}
            language={artifact.language as BundledLanguage}
            className="w-fit dark:[&_.shiki]:!bg-transparent"
          />
        </CodeBlock>
      )}

      {artifact.name === "text" && (
        <div className="prose prose-sm size-full max-w-none overflow-auto px-8 text-foreground dark:prose-invert prose-hr:border-border">
          <Markdown className="h-auto min-w-96 pb-12">{artifact.content}</Markdown>
        </div>
      )}
    </div>
  )
}

export { Artifact }
