"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Button, cn } from "@mijn-ui/react"
import { AnimatePresence, motion } from "framer-motion"
import { Terminal } from "lucide-react"
import { CopyButton } from "@/components/ui/copy-button"
import { useChatStore } from "../stores/chat-store-provider"
import { getMessageTextContent } from "../stores/use-chat-store"
import type { Message, MessagePart, ToolCall } from "../types"
import { Markdown } from "./markdown"
import { AIConversation, AIConversationContent, AIConversationScrollButton } from "./ui/conversation"

const ConversationArea = () => {
  const messages = useChatStore((state) => state.messages)
  const status = useChatStore((state) => state.status)

  return (
    <AIConversation className="relative flex size-full overflow-hidden">
      <AIConversationContent>
        <div className="mx-auto flex w-full max-w-[var(--chat-view-max-width)] flex-col gap-2 pb-[calc(var(--prompt-area-height)_+_10rem)] md:pb-[calc(var(--prompt-area-height)_+_12rem)] md:pt-[var(--header-height)]">
          {messages.map((message, messageIndex) => (
            <MessageContainer
              key={message.id}
              message={message}
              isLast={messageIndex === messages.length - 1}
              status={status}
            />
          ))}
        </div>
      </AIConversationContent>
      <AIConversationScrollButton className="absolute bottom-[calc(var(--prompt-area-height)+5rem)] left-1/2 z-50 -translate-x-1/2 md:bottom-[calc(var(--prompt-area-height)+6rem)]" />
    </AIConversation>
  )
}

interface MessageContainerProps {
  message: Message
  isLast: boolean
  status: string
}

const MessageContainer = ({ message, isLast, status }: MessageContainerProps) => {
  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"
  const isStreaming = isLast && status === "streaming" && isAssistant
  const isThinking = isLast && status === "loading" && isAssistant && message.parts.length === 0

  const Copy = () => {
    const content = getMessageTextContent(message)

    return (
      <div
        className={cn(
          "flex items-center gap-4 py-1",
          isUser && "justify-end opacity-0 transition duration-300 group-hover:opacity-100",
        )}>
        <CopyButton
          variant="ghost"
          size="sm"
          className="hover:bg-background [&>svg]:text-secondary-foreground"
          text={content}
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
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
          {message.parts.map((part, index) => (
            <MessagePart key={`${message.id}-part-${index}`} part={part} isUser={isUser} isStreaming={isStreaming} />
          ))}

          {message && !isStreaming && !isThinking && <Copy />}
        </div>
      </div>
    </motion.div>
  )
}

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

interface MessagePartProps {
  part: MessagePart
  isUser: boolean
  isStreaming?: boolean
}

const MessagePart = ({ part, isUser, isStreaming }: MessagePartProps) => {
  if (part.type === "text") {
    return isUser ? (
      <UserMessage content={part.content} />
    ) : (
      <AssistantTextContent content={part.content} isStreaming={isStreaming} />
    )
  }

  if (part.type === "tool_call" && part.toolCall) {
    return <ToolCallDisplay toolCall={part.toolCall} />
  }

  return null
}

const UserMessage = ({ content }: { content: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={cn("min-w-fit rounded-2xl bg-background px-4 py-3 text-sm text-foreground shadow-sm")}>
    <p className="whitespace-pre-wrap break-words">{content}</p>
  </motion.div>
)

const AssistantTextContent = ({ content }: { content: string; isStreaming?: boolean }) => {
  if (!content.trim()) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group/message relative">
      <div className="prose prose-sm w-full max-w-none dark:prose-invert prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:bg-muted">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Markdown>{content}</Markdown>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const ToolCallDisplay = React.memo(({ toolCall }: { toolCall: ToolCall }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex cursor-pointer items-center gap-2 text-sm" onClick={() => setIsExpanded(!isExpanded)}>
        <Terminal className="size-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{toolCall.function.name}</span>
        <span className="text-xs text-muted-foreground">Tool Call</span>
        <Button size="sm" variant="ghost" className="ml-auto size-6 p-0">
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            ↓
          </motion.div>
        </Button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 space-y-2 overflow-hidden">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">ID:</p>
              <code className="rounded border bg-background px-2 py-1 font-mono text-xs">{toolCall.id}</code>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Arguments:</p>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded border bg-background p-2 font-mono text-xs">
                {JSON.stringify(JSON.parse(toolCall.function.arguments), null, 2)}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

ToolCallDisplay.displayName = "ToolCallDisplay"

// Remove StreamingContent component since we're not using it anymore

const ThinkingMessage = () => (
  <motion.div
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.25 }}
    className="flex items-center gap-2 text-sm text-muted-foreground">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="size-3 rounded-full border border-muted-foreground border-t-transparent"
    />
    <span>Thinking...</span>
  </motion.div>
)

export { ConversationArea }
