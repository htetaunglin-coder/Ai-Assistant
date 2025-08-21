"use client"

import { createContext, useContext, useState } from "react"
import { useStore } from "zustand"
import { ChatStoreProps, ChatStoreState, createChatStore } from "./chat-store"

type ChatStore = ReturnType<typeof createChatStore>

const ChatStoreContext = createContext<ChatStore | null>(null)

type ChatStoreProviderProps = ChatStoreProps & {
  children: React.ReactNode
}

export const ChatStoreProvider: React.FC<ChatStoreProviderProps> = ({
  children,
  initialMessages,
  conversationId,
  options,
}) => {
  const [store] = useState(() => createChatStore({ initialMessages, conversationId, options }))
  return <ChatStoreContext.Provider value={store}>{children}</ChatStoreContext.Provider>
}

export const useChatStore = <T,>(selector: (state: ChatStoreState) => T): T => {
  const store = useContext(ChatStoreContext)

  if (!store) {
    throw new Error("Missing ChatStoreProvider")
  }

  return useStore(store, selector)
}
