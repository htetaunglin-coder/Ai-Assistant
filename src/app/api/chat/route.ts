import { NextRequest } from "next/server"

export const runtime = "edge"

// Types matching your updated message structure
interface ToolCall {
  id: string
  type: "function"
  function: {
    name: string
    arguments: string | object // Allow both string and object
  }
}

interface MessagePart {
  type: "text" | "tool_call"
  content?: string
  toolCall?: ToolCall
}

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  parts: MessagePart[]
  timestamp: Date
  metadata?: Record<string, any>
}

interface StreamResponse {
  type: "content" | "tool_calls" | "conversation_id" | "error"
  content?: string
  tool_calls?: ToolCall[]
  conversation_id?: string
  message?: string
}

export async function POST(req: NextRequest): Promise<Response> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  try {
    const url = new URL(req.url)
    const pathSegments = url.pathname.split("/")

    // Extract conversation ID from URL if present
    // /api/chat -> new conversation
    // /api/chat/conv_abc123 -> existing conversation
    const conversationId = pathSegments.length > 3 ? pathSegments[3] : null
    const isNewConversation = !conversationId

    const { message }: { message: string } = await req.json()

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        const enqueue = (data: string) => controller.enqueue(encoder.encode(data))

        try {
          // For new conversations, send conversation ID first
          if (isNewConversation) {
            const newConversationId = generateConversationId()

            enqueue(
              createStreamChunk({
                type: "conversation_id",
                conversation_id: newConversationId,
              }),
            )
            await new Promise((resolve) => setTimeout(resolve, 100))
          }

          const text1 = "Here's the current stock snapshot for Apple Inc. (AAPL):"

          for (const char of text1) {
            enqueue(
              createStreamChunk({
                type: "content",
                content: char,
              }),
            )
            await new Promise((resolve) => setTimeout(resolve, 25))
          }

          // Handle different message types
          if (message.toLowerCase().includes("stock") || message.toLowerCase().includes("chart")) {
            // First send tool calls with actual objects for chart functions
            const mockToolCalls: ToolCall[] = [
              {
                id: "call_stock_123",
                type: "function",
                function: {
                  name: "chart",
                  arguments: {
                    type: "line",
                    title: "AAPL Stock Price - Last 30 Days",
                    dataKey: "date",
                    description: "The stock has been showing positive momentum over the past week.",
                    data: [
                      { date: "2024-01-01", price: 185.64 },
                      { date: "2024-01-02", price: 160.2 },
                      { date: "2024-01-03", price: 114.25 },
                      { date: "2024-01-04", price: 188.1 },
                      { date: "2024-01-05", price: 191.56 },
                      { date: "2024-01-08", price: 189.33 },
                      { date: "2024-01-09", price: 102.75 },
                      { date: "2024-01-10", price: 190.92 },
                      { date: "2024-01-11", price: 154.44 },
                      { date: "2024-01-12", price: 193.18 },
                      { date: "2024-01-16", price: 148.04 },
                      { date: "2024-01-17", price: 191.76 },
                      { date: "2024-01-18", price: 184.83 },
                      { date: "2024-01-19", price: 197.96 },
                      { date: "2024-01-22", price: 165.18 },
                      { date: "2024-01-23", price: 163.89 },
                      { date: "2024-01-24", price: 140.15 },
                      { date: "2024-01-25", price: 134.17 },
                      { date: "2024-01-26", price: 186.38 },
                      { date: "2024-01-29", price: 192.01 },
                      { date: "2024-01-30", price: 188.86 },
                    ],
                    xAxis: "date",
                    yAxis: "price",
                    color: "#007AFF",
                  },
                },
              },
              {
                id: "call_market_456",
                type: "function",
                function: {
                  name: "chart",
                  arguments: {
                    type: "bar",
                    title: "AAPL Trading Volume",
                    dataKey: "date",
                    data: [
                      { date: "Jan 26", volume: 52300000 },
                      { date: "Jan 27", volume: 48200000 },
                      { date: "Jan 28", volume: 55100000 },
                      { date: "Jan 29", volume: 61400000 },
                      { date: "Jan 30", volume: 49800000 },
                    ],
                    xAxis: "date",
                    yAxis: "volume",
                    color: "#34C759",
                  },
                },
              },
            ]

            enqueue(
              createStreamChunk({
                type: "tool_calls",
                tool_calls: mockToolCalls,
              }),
            )

            await new Promise((resolve) => setTimeout(resolve, 800))

            // Then stream the response content
            const text =
              "Based on the latest market data, AAPL is currently trading at $150.42, up 2.3% from yesterday's close of $147.05. The stock has shown strong momentum with increased volume."

            for (const char of text) {
              enqueue(
                createStreamChunk({
                  type: "content",
                  content: char,
                }),
              )
              await new Promise((resolve) => setTimeout(resolve, 25))
            }
          } else if (message.toLowerCase().includes("weather")) {
            // Weather tool example
            const weatherToolCall: ToolCall = {
              id: "call_weather_789",
              type: "function",
              function: {
                name: "weather",
                arguments: JSON.stringify({
                  location: "Tokyo, Japan",
                  units: "celsius",
                }),
              },
            }

            enqueue(
              createStreamChunk({
                type: "tool_calls",
                tool_calls: [weatherToolCall],
              }),
            )
            await new Promise((resolve) => setTimeout(resolve, 600))

            const text =
              "🌤️ The current weather in Tokyo is 22°C with partly cloudy skies. Humidity is at 65% with light winds from the northeast. Perfect conditions for a walk in the city!"

            for (const char of text) {
              enqueue(
                createStreamChunk({
                  type: "content",
                  content: char,
                }),
              )
              await new Promise((resolve) => setTimeout(resolve, 25))
            }
          } else if (message.toLowerCase().includes("mixed")) {
            // Example of mixed content - tool call, then text, then another tool call

            // First tool call
            const searchTool: ToolCall = {
              id: "call_search_001",
              type: "function",
              function: {
                name: "search",
                arguments: JSON.stringify({
                  query: "latest AI developments 2024",
                }),
              },
            }

            enqueue(
              createStreamChunk({
                type: "tool_calls",
                tool_calls: [searchTool],
              }),
            )
            await new Promise((resolve) => setTimeout(resolve, 500))

            // Some text content
            const firstText = "Let me search for the latest information... "
            for (const char of firstText) {
              enqueue(
                createStreamChunk({
                  type: "content",
                  content: char,
                }),
              )
              await new Promise((resolve) => setTimeout(resolve, 30))
            }

            await new Promise((resolve) => setTimeout(resolve, 300))

            // Second tool call with chart
            const chartTool: ToolCall = {
              id: "call_chart_002",
              type: "function",
              function: {
                name: "chart",
                arguments: {
                  type: "area",
                  title: "AI Development Trends 2024",
                  description: "The stock has been showing positive momentum over the past week.",
                  data: [
                    { month: "Jan", progress: 85 },
                    { month: "Feb", progress: 92 },
                    { month: "Mar", progress: 88 },
                    { month: "Apr", progress: 94 },
                    { month: "May", progress: 97 },
                    { month: "Jun", progress: 89 },
                    { month: "Jul", progress: 96 },
                  ],
                  xAxis: "month",
                  yAxis: "progress",
                  color: "#FF9500",
                },
              },
            }

            enqueue(
              createStreamChunk({
                type: "tool_calls",
                tool_calls: [chartTool],
              }),
            )
            await new Promise((resolve) => setTimeout(resolve, 400))

            // Final text content
            const finalText =
              "Based on my analysis, AI development in 2024 has been remarkable, with significant advances in reasoning capabilities and multimodal understanding."
            for (const char of finalText) {
              enqueue(
                createStreamChunk({
                  type: "content",
                  content: char,
                }),
              )
              await new Promise((resolve) => setTimeout(resolve, 25))
            }
          } else if (message.toLowerCase().includes("error")) {
            // Test error handling
            enqueue(
              createStreamChunk({
                type: "error",
                message: "This is a test error message to verify error handling",
              }),
            )
            return
          } else {
            // Regular text response with varied content
            const responses = [
              "This is a simple text response from the mock API. How can I help you further?",
              "I understand your message and I'm here to assist! What would you like to explore?",
              "That's an interesting question. Let me think about that and provide you with a thoughtful response...",
              `You said: "${message}". I appreciate you sharing that with me. How can I assist you further?`,
              "Hello! I'm your AI assistant. I can help with various tasks including answering questions, providing information, and assisting with analysis. What would you like to know?",
              "Great question! I'm designed to be helpful, harmless, and honest. I can assist with a wide range of topics including general knowledge, creative tasks, analysis, and more.",
            ]

            const text = responses[Math.floor(Math.random() * responses.length)]
            for (const char of text) {
              enqueue(
                createStreamChunk({
                  type: "content",
                  content: char,
                }),
              )
              await new Promise((resolve) => setTimeout(resolve, 30))
            }
          }

          // End the stream
          controller.close()
        } catch (error) {
          // Handle streaming errors
          enqueue(
            createStreamChunk({
              type: "error",
              message: error instanceof Error ? error.message : "Unknown error occurred during streaming",
            }),
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    // Handle request parsing errors
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to process request",
        details: "Error occurred while parsing the request or setting up the stream",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

// GET handler to load conversation history with parts-based messages
export async function GET(req: NextRequest): Promise<Response> {
  try {
    const url = new URL(req.url)
    const pathSegments = url.pathname.split("/")

    // Check if this is a conversations endpoint
    if (pathSegments.includes("conversations")) {
      const conversationId = pathSegments[pathSegments.length - 1]

      // Mock conversation history with parts-based messages including chart
      const mockHistory = {
        id: conversationId,
        messages: [
          {
            id: generateMessageId(),
            role: "user" as const,
            parts: [
              {
                type: "text" as const,
                content: "Hello! Can you show me a stock chart?",
              },
            ],
            timestamp: new Date(Date.now() - 300000), // 5 minutes ago
            metadata: {
              source: "user_input",
            },
          },
          {
            id: generateMessageId(),
            role: "assistant" as const,
            parts: [
              {
                type: "tool_call" as const,
                toolCall: {
                  id: "call_historical_chart_001",
                  name: "chart",
                  type: "function" as const,
                  function: {
                    name: "chart",
                    arguments: {
                      type: "line",
                      title: "Apple Stock Performance",
                      description: "The stock has been showing positive momentum over the past week.",
                      dataKey: "date",
                      data: [
                        { date: "2024-01-15", price: 180.5 },
                        { date: "2024-01-16", price: 182.2 },
                        { date: "2024-01-17", price: 185.3 },
                        { date: "2024-01-18", price: 188.75 },
                        { date: "2024-01-19", price: 190.42 },
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
            metadata: {
              model: "mock-assistant-v1",
            },
          },
        ],
      }

      return new Response(JSON.stringify(mockHistory), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    }

    // Handle other GET requests
    return new Response(
      JSON.stringify({
        error: "Endpoint not found",
      }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to load conversation",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

// Utility functions
const createStreamChunk = (response: StreamResponse): string => {
  return `data: ${JSON.stringify(response)}\n\n`
}

const generateConversationId = (): string => {
  return `conv_${Math.random().toString(36).substring(2)}_${Date.now().toString(36)}`
}

const generateMessageId = (): string => {
  return `msg_${Math.random().toString(36).substring(2)}_${Date.now().toString(36)}`
}
