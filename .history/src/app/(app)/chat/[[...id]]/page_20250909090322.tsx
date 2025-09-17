import { UserProfile } from "@/features/auth/components/user-profile"
import { ChatView } from "@/features/chat/chat-view"
import { Artifact } from "@/features/chat/components/artifacts"
import { ChatLayout, getServerSideChatLayoutCookieData } from "@/features/chat/components/layout"
import { ChatStoreProvider } from "@/features/chat/stores/chat-store-provider"
import { type Artifact as ArtifactType } from "@/features/chat/types"
import { DynamicPanelContent } from "@/features/panel/dynamic-panel-content"

// TODO: Update with an actual data once the backend is ready.

const Page = async (props: { params: Promise<{ id: string }> }) => {
  const defaultValues = await getServerSideChatLayoutCookieData()
  const params = await props.params
  const id = params?.id

  let data
  if (id) {
    data = await createMockConversationHistory(id)
  }

  return (
    <ChatStoreProvider
      // eslint-disable-next-line
      // @ts-ignore
      initialMessages={data?.messages ?? []}
      conversationId={data?.id ?? null}>
      <ChatLayout
        defaultValues={defaultValues}
        headerSlot={<UserProfile />}
        menuSlot={<DynamicPanelContent />}
        artifactSlot={<Artifact />}>
        <ChatView />
      </ChatLayout>
    </ChatStoreProvider>
  )
}

export default Page

/* -------------------------------------------------------------------------- */

const generateId = (prefix: string): string => {
  return `${prefix}_${Math.random().toString(36).substring(2)}_${Date.now().toString(36)}`
}

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
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
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        metadata: { source: "user_input" },
      },
      {
        id: generateId("msg"),
        role: "assistant" as const,
        parts: [
          {
            type: "tool_call" as const,
            tool_call: {
              id: generateId("call_historical_chart"),
              name: "chart",
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
          {
            type: "text" as const,
            content:
              "Here's the Apple stock chart you requested. The stock has been showing positive momentum over the past week.",
          },
        ],
        timestamp: new Date(Date.now() - 295000).toISOString(), // 4:55 minutes ago
        metadata: { model: "mock-assistant-v1" },
      },
      {
        id: generateId("msg"),
        role: "user" as const,
        parts: [
          {
            type: "text" as const,
            content: "Can you create a simple calculator webpage for me?",
          },
        ],
        timestamp: new Date(Date.now() - 200000).toISOString(), // 3:20 minutes ago
        metadata: { source: "user_input" },
      },
      {
        id: generateId("msg"),
        role: "assistant" as const,
        parts: [
          {
            type: "text" as const,
            content: "I'll create a simple calculator webpage for you with basic arithmetic operations.",
          },
          {
            type: "artifact" as const,
            artifact: {
              id: "simple-calculator",
              name: "calculator",
              title: "Simple Calculator",
              type: "code" as const,
              status: "completed" as const,
            },
          },
        ],
        timestamp: new Date(Date.now() - 190000).toISOString(), // 3:10 minutes ago
        metadata: { model: "mock-assistant-v1" },
      },
      {
        id: generateId("msg"),
        role: "user" as const,
        parts: [
          {
            type: "text" as const,
            content: "That's great! Can you also create a Python script for generating Fibonacci numbers?",
          },
        ],
        timestamp: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
        metadata: { source: "user_input" },
      },
      {
        id: generateId("msg"),
        role: "assistant" as const,
        parts: [
          {
            type: "text" as const,
            content: "Sure! I'll create a Python script that generates Fibonacci numbers with an example usage.",
          },
          {
            type: "artifact" as const,
            artifact: {
              id: "fibonacci-generator",
              name: "fibonacci",
              title: "Fibonacci Generator",
              type: "code" as const,
              status: "completed" as const,
            },
          },
        ],
        timestamp: new Date(Date.now() - 110000).toISOString(), // 1:50 minutes ago
        metadata: { model: "mock-assistant-v1" },
      },
    ],
  }
}

// Mock artifacts that would be in your artifact store
export const MOCK_ARTIFACTS: Record<string, ArtifactType> = {
  "simple-calculator": {
    id: "simple-calculator",
    name: "calculator",
    title: "Simple Calculator",
    type: "code",
    status: "completed",
    content: `<!DOCTYPE html>
<html>
<head>
    <title>Simple Calculator</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .calculator { max-width: 300px; margin: 0 auto; }
        button { width: 60px; height: 60px; margin: 5px; font-size: 18px; }
        input { width: 280px; height: 40px; font-size: 20px; text-align: right; }
    </style>
</head>
<body>
    <div class="calculator">
        <input type="text" id="display" readonly>
        <br>
        <button onclick="clearDisplay()">C</button>
        <button onclick="appendToDisplay('/')">/</button>
        <button onclick="appendToDisplay('*')">*</button>
        <button onclick="deleteLast()">←</button>
        <br>
        <button onclick="appendToDisplay('7')">7</button>
        <button onclick="appendToDisplay('8')">8</button>
        <button onclick="appendToDisplay('9')">9</button>
        <button onclick="appendToDisplay('-')">-</button>
    </div>
    <script>
        function appendToDisplay(value) {
            document.getElementById('display').value += value;
        }
        function clearDisplay() {
            document.getElementById('display').value = '';
        }
        function deleteLast() {
            const display = document.getElementById('display');
            display.value = display.value.slice(0, -1);
        }
        function calculate() {
            const display = document.getElementById('display');
            try {
                display.value = eval(display.value);
            } catch (error) {
                display.value = 'Error';
            }
        }
    </script>
</body>
</html>`,
  },
  "fibonacci-generator": {
    id: "fibonacci-generator",
    name: "fibonacci",
    title: "Fibonacci Generator",
    type: "code",
    status: "completed",
    content: `def fibonacci(n):
    """Generate Fibonacci sequence up to n terms"""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[i-1] + sequence[i-2])
    
    return sequence

# Example usage
if __name__ == "__main__":
    terms = 10
    result = fibonacci(terms)
    print(f"First {terms} Fibonacci numbers: {result}")`,
  },
}
