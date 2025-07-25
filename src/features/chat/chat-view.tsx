"use client"

import { ScrollArea } from "@mijn-ui/react"
import { AnimatePresence } from "framer-motion"
import Messages from "./components/messages"
import PromptArea from "./components/prompt-area"
import { useChat } from "./hooks/use-chat"

const ChatView = () => {
  const { messages, status, input, setInput, handleSubmit } = useChat()

  const hasConversation = messages.length > 0

  return (
    <ScrollArea className="relative flex h-[calc(100svh_-_var(--main-area-padding)-0.5rem)] w-full overflow-auto">
      <AnimatePresence>
        <div className="mx-auto flex size-full flex-col gap-8 pb-[calc(var(--prompt-area-height)_+_12rem)] pt-[var(--header-height)]">
          {hasConversation && (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
              {messages.map((message, index) => (
                <Messages
                  key={index}
                  role={message.role}
                  content={message.content}
                  isStreaming={status === "streaming" && index === messages.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </AnimatePresence>

      <PromptArea
        input={input}
        status={status}
        hasConversation={hasConversation}
        onInputChange={(e) => setInput(e.target.value)}
        onSubmit={handleSubmit}
      />
    </ScrollArea>
  )
}

export { ChatView }
