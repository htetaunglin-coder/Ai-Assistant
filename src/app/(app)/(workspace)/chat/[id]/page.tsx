import { chatServerAPI } from "@/features/chat/api/server"
import { ChatView } from "@/features/chat/chat-view"
import { ChatStoreProvider } from "@/features/chat/stores/chat-store-provider"

const Page = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params
  const id = params?.id

  const messages = await chatServerAPI.getMessages(id)

  return (
    <ChatStoreProvider initialMessages={messages.data} conversationId={id}>
      <ChatView />
    </ChatStoreProvider>
  )
}

export default Page

/* -------------------------------------------------------------------------- */

// const mockMessags: BackendMessage[] = [
//   {
//     conversation_title: "Hello",
//     conversation_id: "29",
//     role: "user",
//     status: "created",
//     parts: '[{"type":"text","content":"Hello there!"}]',
//     message_id: "123",
//     response_id: "103",
//     created_at: "2025-10-30T10:01:47.000000Z",
//     updated_at: "2025-10-30T10:01:47.000000Z",
//   },
//   {
//     conversation_title: "Hello",
//     conversation_id: "29",
//     role: "assistant",
//     status: "created",
//     parts:
//       '[{"type":"text","content":"Hello! How can I assist you today? If you have any questions about medical or supplement products, ERP features, or need help with the PicoSBS system, just let me know!"}]',
//     message_id: "113",
//     response_id: "133",
//     created_at: "2025-10-30T10:01:52.000000Z",
//     updated_at: "2025-10-30T10:01:55.000000Z",
//   },
// ]
