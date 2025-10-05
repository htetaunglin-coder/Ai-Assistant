import Image from "next/image"
import { Button, cn } from "@mijn-ui/react"
import { motion } from "framer-motion"
import { PANEL_IDS } from "@/components/app-layout/app-layout"
import { ResizableLayoutOpen } from "@/components/resizable-layout"
import { CopyButton } from "@/components/ui/copy-button"
import { ChatStatus, getMessageTextContent } from "../stores/chat-store"
import { Message } from "../types"
import { Markdown } from "./markdown"
import { ToolCallPreview } from "./tools"
import { StatusDisplay } from "./ui/status-display"

type PreviewMessageProps = {
  message: Message
  status: ChatStatus
  isLast: boolean
}

export const PreviewMessage = ({ message, status, isLast }: PreviewMessageProps) => {
  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"
  const isStreaming = isLast && status === "streaming" && isAssistant
  const isThinking = isLast && status === "loading" && isAssistant && message.parts.length === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      data-role={message.role}
      className={cn("group flex items-start gap-3 px-4", isUser && "justify-end", isAssistant && "flex-col")}>
      {isAssistant && <AssistantHeader />}

      <div
        className={cn(
          "flex w-full flex-col gap-3",
          isUser && "w-fit max-w-[calc(var(--chat-view-max-width)*0.7)] items-end",
        )}>
        {isThinking && <ThinkingMessage />}

        <div className={cn("flex w-full flex-col gap-2", isUser && "gap-0")}>
          {message.parts.map((part, index) => {
            const key = `${message.message_id}-part-${index}`

            if (part.type === "text") {
              return isUser ? (
                <UserMessage key={key} content={part.content} />
              ) : (
                <AssistantTextContent key={key} content={part.content} />
              )
            }

            if (part.type === "tool_call" && part.tool_call) {
              return <ToolCallPreview key={key} tool={part.tool_call} />
            }

            if (part.type === "artifact" && part.artifact) {
              return (
                <ResizableLayoutOpen panelId={PANEL_IDS.ARTIFACT} key={part.artifact.id} className="w-full text-left">
                  <StatusDisplay title={part.artifact.title} status={part.artifact.status} />
                </ResizableLayoutOpen>
              )
            }

            return null
          })}

          {message && !isStreaming && !isThinking && (
            <div
              className={cn(
                "flex items-center gap-4 py-1",
                isUser && "justify-end opacity-0 transition duration-300 group-hover:opacity-100",
              )}>
              <CopyMessage message={message} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const CopyMessage = ({ message }: { message: Message }) => {
  const content = getMessageTextContent(message)

  return (
    <CopyButton
      variant="ghost"
      size="sm"
      className="hover:bg-background [&>svg]:text-secondary-foreground/80"
      content={content}
    />
  )
}

const UserMessage = ({ content }: { content: string }) => (
  <motion.div
    initial={{
      opacity: 0,
      scale: 0.95,
    }}
    animate={{ opacity: 1, scale: 1 }}
    className="min-w-fit rounded-xl border bg-background px-4 py-3 text-sm text-foreground dark:border-transparent">
    <p className="whitespace-pre-wrap break-words">{content}</p>
  </motion.div>
)

const AssistantHeader = () => (
  <div className="mb-1 flex items-center gap-2">
    <Button className="flex size-7 shrink-0 items-center justify-center rounded-full !p-0" iconOnly variant="ghost">
      <Image src="/images/picosbs.png" width={28} height={28} alt="Pica Bot" />
    </Button>
    <span className="text-xs font-medium text-foreground">Pica Bot</span>
    <span className="text-xs text-muted-foreground">•</span>
    <span className="text-xs font-medium text-muted-foreground">GPT-4</span>
  </div>
)

const AssistantTextContent = ({ content }: { content: string }) => {
  if (!content.trim()) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group/message relative">
      <div className="prose prose-sm w-full max-w-none text-foreground dark:prose-invert prose-hr:border-border">
        <Markdown>{content}</Markdown>
      </div>
    </motion.div>
  )
}

const ThinkingMessage = () => (
  <motion.div
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.25 }}
    className="flex items-center gap-2 text-sm text-muted-foreground">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      }}
      className="size-3 rounded-full border border-muted-foreground border-t-transparent"
    />
    <span>Thinking...</span>
  </motion.div>
)
