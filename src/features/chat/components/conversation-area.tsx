"use client"

import { useChatStore } from "../stores/chat-store-provider"
import { Message } from "./message"
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "./ui/conversation"

const ConversationArea = () => {
  const messages = useChatStore(
    (state) => state.messages,
  )
  const status = useChatStore(
    (state) => state.status,
  )

  return (
    <AIConversation className="relative flex size-full overflow-hidden">
      <AIConversationContent>
        <div className="mx-auto flex w-full max-w-[var(--chat-view-max-width)] flex-col gap-2 pb-[calc(var(--prompt-area-height)_+_10rem)] md:pb-[calc(var(--prompt-area-height)_+_12rem)] md:pt-[var(--header-height)]">
          {messages.map(
            (message, messageIndex) => (
              <Message
                key={message.id}
                message={message}
                isLast={
                  messageIndex ===
                  messages.length - 1
                }
                status={status}
              />
            ),
          )}
        </div>
      </AIConversationContent>
      <AIConversationScrollButton className="absolute bottom-[calc(var(--prompt-area-height)+5rem)] left-1/2 z-50 -translate-x-1/2 md:bottom-[calc(var(--prompt-area-height)+6rem)]" />
    </AIConversation>
  )
}

export { ConversationArea }
