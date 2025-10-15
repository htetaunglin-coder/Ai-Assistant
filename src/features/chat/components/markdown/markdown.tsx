"use client"

import type { HTMLAttributes } from "react"
import React, { memo } from "react"
import { cn } from "@mijn-ui/react"
import "katex/dist/katex.min.css"
import ReactMarkdown, { type Options } from "react-markdown"
import rehypeKatex from "rehype-katex"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { getIconForFilename } from "@/components/file-name-icon-map"
import { BundledLanguage, CodeBlock, CodeBlockContent, CodeBlockCopyButton } from "../ui/code-block"
import remarkYoutubePlugin from "./remark-youtube"

const components: Options["components"] = {
  h1: ({ node: _, ...props }) => <h1 className="text-2xl font-semibold sm:text-3xl" {...props} />,
  h2: ({ node: _, ...props }) => <h2 className="text-xl font-semibold sm:text-2xl" {...props} />,
  h3: ({ node: _, ...props }) => <h3 className="text-lg font-semibold sm:text-xl" {...props} />,
  h4: ({ node: _, ...props }) => <h4 className="text-md font-semibold sm:text-lg" {...props} />,
  h5: ({ node: _, ...props }) => <h5 className="text-base font-semibold" {...props} />,
  h6: ({ node: _, ...props }) => <h6 className="text-sm font-semibold" {...props} />,
  pre: ({ node: _, className, ...props }) => <pre className={cn("not-prose w-full", className)} {...props} />,

  code: ({ node, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "")
    const codeContent = String(children).replace(/\n$/, "")

    if (match) {
      let filename: string | null = null
      if (node?.data?.meta) {
        const metaString = node.data.meta as string
        const filenameMatch = metaString.match(/filename=["']([^"]+)["']/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      return <FencedCodeBlock language={match[1]} filename={filename} code={codeContent} />
    }

    return (
      <code
        className={cn("whitespace-pre-wrap break-all rounded-md bg-muted px-1.5 py-0.5 text-sm", className)}
        {...props}>
        {children}
      </code>
    )
  },
}

/* -------------------------------------------------------------------------- */

export type MarkdownProps = HTMLAttributes<HTMLDivElement> & {
  options?: Options
  children: Options["children"]
}

const PureMarkdown = ({ className, options, children, ...props }: MarkdownProps) => (
  <div
    className={cn(
      "markdown size-full max-w-[var(--chat-view-max-width)] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
      className,
    )}
    {...props}>
    <ReactMarkdown
      components={{ ...components, ...options?.components }}
      rehypePlugins={[rehypeKatex]}
      remarkPlugins={[remarkGfm, remarkMath, remarkYoutubePlugin]}
      {...options}>
      {children}
    </ReactMarkdown>
  </div>
)

export const Markdown = memo(PureMarkdown, (prevProps, nextProps) => prevProps.children === nextProps.children)

/* -------------------------------------------------------------------------- */

type FencedCodeBlockProps = {
  language: string
  filename: string | null
  code: string
}

const PureFencedCodeBlock = ({ language, filename, code }: FencedCodeBlockProps) => {
  return (
    <CodeBlock className="not-prose relative my-4 w-full md:max-w-lg lg:max-w-none">
      {filename && (
        <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
          <div className="flex items-center gap-2">
            {getIconForFilename(filename) && (
              <div className="flex size-4 items-center justify-center">
                {React.createElement(getIconForFilename(filename)!, { size: 14 })}
              </div>
            )}
            <span className="text-sm font-medium text-muted-foreground">{filename}</span>
          </div>
          <CodeBlockCopyButton code={code} size="sm" />
        </div>
      )}

      {!filename && <CodeBlockCopyButton className="absolute right-2 top-2 z-10" code={code} size="sm" />}

      <CodeBlockContent
        code={code}
        language={language as BundledLanguage}
        syntaxHighlighting={true}
        lineNumbers={true}
        className="text-sm"
      />
    </CodeBlock>
  )
}

const FencedCodeBlock = memo(PureFencedCodeBlock)
