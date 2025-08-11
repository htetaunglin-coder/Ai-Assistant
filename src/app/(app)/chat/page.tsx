import { ChatView } from "@/features/chat/chat-view"
import { ChatStoreProvider } from "@/features/chat/stores/chat-store-provider"

const ChatPage = async () => {
  return (
    <ChatStoreProvider>
      <ChatView />
    </ChatStoreProvider>
  )
}

export default ChatPage
