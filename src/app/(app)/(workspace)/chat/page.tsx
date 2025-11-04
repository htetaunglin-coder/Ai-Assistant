import { ChatView } from "@/features/chat/chat-view"
import { ChatStoreProvider } from "@/features/chat/stores/chat-store-provider"
import { authServerAPI } from "@/lib/auth/server"
import { RefreshAccessToken } from "@/components/refresh-access-token"

const Chat = async () => {
  const session = await authServerAPI.validateTokenCached()

  if (!session) {
    return <RefreshAccessToken />
  }

  return (
    <ChatStoreProvider>
      <ChatView />
    </ChatStoreProvider>
  )
}

export default Chat
