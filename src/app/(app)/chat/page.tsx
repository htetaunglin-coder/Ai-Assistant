import { ChatView } from "@/features/chat/chat-view"
import { ChatStoreProvider } from "@/features/chat/stores/chat-store-provider"

const Chat = () => {
  return (
    <ChatStoreProvider>
      <ChatView />
    </ChatStoreProvider>
  )
}

export default Chat
