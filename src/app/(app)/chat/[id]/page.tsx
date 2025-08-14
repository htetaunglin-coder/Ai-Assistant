import { ChatView } from "@/features/chat/chat-view"
import { ChatStoreProvider } from "@/features/chat/stores/chat-store-provider"

// TODO: Update with an actual data once the backend is ready.

const Page = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params
  const { id } = params

  const data = await createMockConversationHistory(id)

  return (
    // eslint-disable-next-line
    // @ts-ignore
    <ChatStoreProvider conversationId={data.id} initialMessages={data.messages}>
      <ChatView />
    </ChatStoreProvider>
  )
}

export default Page

/* -------------------------------------------------------------------------- */

const generateId = (prefix: string): string => {
  return `${prefix}_${Math.random().toString(36).substring(2)}_${Date.now().toString(36)}`
}

const createMockConversationHistory = async (conversationId: string) => {
  await sleep(500)

  return {
    id: conversationId,
    messages: [
      {
        id: generateId("msg"),
        role: "user" as const,
        parts: [
          {
            type: "text" as const,
            content: "Hello! Can you show me a stock chart?",
          },
        ],
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        metadata: { source: "user_input" },
      },
      {
        id: generateId("msg"),
        role: "assistant" as const,
        parts: [
          {
            type: "tool_call" as const,
            toolCall: {
              id: generateId("call_historical_chart"),
              type: "function" as const,
              state: "completed",
              function: {
                name: "tool-chart",
                arguments: {
                  type: "line",
                  title: "Apple Stock Performance",
                  description: "The stock has been showing positive momentum over the past week.",
                  dataKey: "date",
                  data: [
                    { date: "2024-01-15", price: 102.5 },
                    { date: "2024-01-16", price: 152.2 },
                    { date: "2024-01-17", price: 85.3 },
                    { date: "2024-01-18", price: 168.75 },
                    { date: "2024-01-19", price: 180.42 },
                  ],
                  xAxis: "date",
                  yAxis: "price",
                  color: "#007AFF",
                },
              },
            },
          },
          {
            type: "text" as const,
            content:
              "Here's the Apple stock chart you requested. The stock has been showing positive momentum over the past week.",
          },
        ],
        timestamp: new Date(Date.now() - 295000), // 4:55 minutes ago
        metadata: { model: "mock-assistant-v1" },
      },
    ],
  }
}

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
