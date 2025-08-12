import React, { useState } from "react"
import Image from "next/image"
import { Button, cn } from "@mijn-ui/react"
import { AnimatePresence, motion } from "framer-motion"
import { Terminal } from "lucide-react"
import { CopyButton } from "@/components/ui/copy-button"
import { getMessageTextContent } from "../stores/use-chat-store"
import { ChatStatus, Message as MessageType, ToolCall } from "../types"
import Chart, { BarChart } from "./chart"
import { Markdown } from "./markdown"

interface MessageProps {
  message: MessageType
  status: ChatStatus
  isLast: boolean
}

export const Message = ({ message, status, isLast }: MessageProps) => {
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
      className={cn("group flex items-start gap-3", isUser && "justify-end", isAssistant && "flex-col")}>
      {isAssistant && <AssistantHeader />}

      <div
        className={cn(
          "flex w-full flex-col gap-3",
          isUser && "w-fit max-w-[calc(var(--chat-view-max-width)*0.7)] items-end",
        )}>
        {isThinking && <ThinkingMessage />}

        <div className={cn("flex w-full flex-col gap-2", isUser && "gap-0")}>
          {message.parts.map((part, index) => {
            const key = `${message.id}-part-${index}`

            if (part.type === "text") {
              return isUser ? (
                <UserMessage key={key} content={part.content} />
              ) : (
                <AssistantTextContent key={key} content={part.content} />
              )
            }

            if (part.type === "tool_call" && part.toolCall) {
              return <ToolCallDisplay key={key} toolCall={part.toolCall} />
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

const CopyMessage = ({ message }: { message: MessageType }) => {
  const content = getMessageTextContent(message)

  return (
    <CopyButton
      variant="ghost"
      size="sm"
      className="hover:bg-background [&>svg]:text-secondary-foreground"
      text={content}
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
    className="min-w-fit rounded-xl bg-background px-4 py-3 text-sm text-foreground shadow-sm">
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
      <div className="prose prose-sm w-full max-w-none dark:prose-invert prose-hr:border-border">
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

export const ToolCallDisplay = React.memo(({ toolCall }: { toolCall: ToolCall }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (toolCall.function.name === "chart") {
    return <Chart key={toolCall.id} {...toolCall.function.arguments} />
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex cursor-pointer items-center gap-2 text-sm" onClick={() => setIsExpanded(!isExpanded)}>
        <Terminal className="size-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{toolCall.function.name}</span>
        <span className="text-xs text-muted-foreground">Tool Call</span>
        <Button size="sm" variant="ghost" className="ml-auto size-6 p-0">
          <motion.div
            animate={{
              rotate: isExpanded ? 180 : 0,
            }}
            transition={{
              duration: 0.2,
            }}>
            ↓
          </motion.div>
        </Button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            className="mt-3 space-y-2 overflow-hidden">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">ID:</p>
              <code className="rounded border bg-background px-2 py-1 font-mono text-xs">{toolCall.id}</code>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Arguments:</p>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded border bg-background p-2 font-mono text-xs"></pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

ToolCallDisplay.displayName = "ToolCallDisplay"
