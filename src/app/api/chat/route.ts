import { NextRequest } from "next/server"

export const runtime = "edge"

// ============================================================================
// Types and Interfaces
// ============================================================================

interface ToolCall {
  id: string
  type: "function"
  function: {
    name: string
    arguments: string | object
  }
  state?: "loading" | "completed" | "error"
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

// ============================================================================
// Constants
// ============================================================================

const STREAMING_DELAYS = {
  INITIAL: 1000,
  BETWEEN_CHUNKS: 100,
  CHAR_TYPING: 25,
  CHAR_TYPING_SLOW: 30,
  TOOL_LOADING: 800,
  TOOL_LOADING_LONG: 1500,
  AFTER_TOOL: 200,
  AFTER_TOOL_LONG: 300,
} as const

const MOCK_RESPONSES = [
  "This is a simple text response from the mock API. How can I help you further?",
  "I understand your message and I'm here to assist! What would you like to explore?",
  "That's an interesting question. Let me think about that and provide you with a thoughtful response...",
  "Hello! I'm your AI assistant. I can help with various tasks including answering questions, providing information, and assisting with analysis. What would you like to know?",
  "Great question! I'm designed to be helpful, harmless, and honest. I can assist with a wide range of topics including general knowledge, creative tasks, analysis, and more.",
] as const

// ============================================================================
// Utility Functions
// ============================================================================

const createStreamChunk = (response: StreamResponse): string => {
  return `data: ${JSON.stringify(response)}

`
}

const generateId = (prefix: string): string => {
  return `${prefix}_${Math.random().toString(36).substring(2)}_${Date.now().toString(36)}`
}

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ============================================================================
// Stream Utilities
// ============================================================================

class StreamController {
  private encoder = new TextEncoder()

  constructor(private controller: ReadableStreamDefaultController) {}

  enqueue(data: string): void {
    this.controller.enqueue(this.encoder.encode(data))
  }

  async sendChunk(response: StreamResponse): Promise<void> {
    this.enqueue(createStreamChunk(response))
  }

  async sendContent(content: string, delay = STREAMING_DELAYS.CHAR_TYPING): Promise<void> {
    for (const char of content) {
      await this.sendChunk({ type: "content", content: char })
      await sleep(delay)
    }
  }

  async sendConversationId(conversationId: string): Promise<void> {
    await this.sendChunk({
      type: "conversation_id",
      conversation_id: conversationId,
    })
    await sleep(STREAMING_DELAYS.BETWEEN_CHUNKS)
  }

  async sendToolCalls(toolCalls: ToolCall[], delay = STREAMING_DELAYS.AFTER_TOOL): Promise<void> {
    await this.sendChunk({
      type: "tool_calls",
      tool_calls: toolCalls,
    })
    await sleep(delay)
  }

  close(): void {
    this.controller.close()
  }

  sendError(message: string): void {
    this.enqueue(
      createStreamChunk({
        type: "error",
        message,
      }),
    )
    this.close()
  }
}

// ============================================================================
// Mock Data Generators
// ============================================================================

const createProductMockData = () => {
  return {
    products: [
      {
        id: "1",
        name: "DHC Collagen (30 Days) 180'S",
        price: 299.0, // Parsed from "29900" (assuming cents or currency unit)
        imageUrl:
          "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWVkaWNpbmV8ZW58MHx8MHx8fDA%3D",
        stock: 60,
        // Secondary fields for side panel/modal
        sku: "0000001",
        brand_name: "DHC",
        category_name: "Health Supplements",
      },
      {
        id: "2",
        name: "DHC Vitamin C 1000mg",
        price: 199.0,
        imageUrl:
          "https://images.unsplash.com/photo-1562243061-204550d8a2c9?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        stock: 45,
        sku: "0000002",
        brand_name: "DHC",
        category_name: "Health Supplements",
      },
      {
        id: "4",
        name: "DHC Folic Acid",
        price: 149.0,
        imageUrl:
          "https://plus.unsplash.com/premium_photo-1668487826871-2f2cac23ad56?q=80&w=1112&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        stock: 0,
        sku: "0000004",
        brand_name: "DHC",
        category_name: "Health Supplements",
      },
    ],
  }
}

const createStockData = () => [
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
]

const createVolumeData = () => [
  { date: "Jan 26", volume: 52300000 },
  { date: "Jan 27", volume: 48200000 },
  { date: "Jan 28", volume: 55100000 },
  { date: "Jan 29", volume: 61400000 },
  { date: "Jan 30", volume: 49800000 },
]

const createTrendData = () => [
  { month: "Jan", progress: 85 },
  { month: "Feb", progress: 92 },
  { month: "Mar", progress: 88 },
  { month: "Apr", progress: 94 },
  { month: "May", progress: 97 },
  { month: "Jun", progress: 89 },
  { month: "Jul", progress: 96 },
]

// ============================================================================
// Response Handlers
// ============================================================================

class ResponseHandler {
  constructor(private stream: StreamController) {}

  async handleProductRequest(): Promise<void> {
    const loadingTool: ToolCall = {
      id: generateId("call_product"),
      type: "function",
      state: "loading",
      function: {
        name: "tool-products",
        arguments: {
          title: "Searching for products...",
          description: "Please wait while I fetch product information.",
        },
      },
    }

    await this.stream.sendToolCalls([loadingTool])
    await sleep(STREAMING_DELAYS.TOOL_LOADING_LONG)

    const completedTool: ToolCall = {
      id: loadingTool.id,
      type: "function",
      state: "completed",
      function: {
        name: "tool-products",
        arguments: {
          title: "Found some products for you",
          products: [...createProductMockData().products],
        },
      },
    }

    await this.stream.sendToolCalls([completedTool], STREAMING_DELAYS.AFTER_TOOL)

    const responseText =
      "I found a few products that might interest you. Let me know if you'd like to see more details or add them to your cart."
    await this.stream.sendContent(responseText)
  }

  async handleStockRequest(): Promise<void> {
    // Send loading tool calls
    const loadingTools: ToolCall[] = [
      {
        id: generateId("call_stock"),
        type: "function",
        state: "loading",
        function: {
          name: "tool-chart",
          arguments: {
            type: "line",
            title: "AAPL Stock Price - Last 30 Days",
            description: "Fetching latest stock data...",
          },
        },
      },
      {
        id: generateId("call_market"),
        type: "function",
        state: "loading",
        function: {
          name: "tool-chart",
          arguments: {
            type: "bar",
            title: "AAPL Trading Volume",
            description: "Loading volume data...",
          },
        },
      },
    ]

    await this.stream.sendToolCalls(loadingTools)
    await sleep(STREAMING_DELAYS.TOOL_LOADING_LONG)

    // Send completed tool calls
    const completedTools: ToolCall[] = [
      {
        id: loadingTools[0].id,
        type: "function",
        state: "completed",
        function: {
          name: "tool-chart",
          arguments: {
            type: "line",
            title: "AAPL Stock Price - Last 30 Days",
            dataKey: "date",
            description: "The stock has been showing positive momentum over the past week.",
            data: createStockData(),
            xAxis: "date",
            yAxis: "price",
            color: "#007AFF",
          },
        },
      },
      {
        id: loadingTools[1].id,
        type: "function",
        state: "completed",
        function: {
          name: "tool-chart",
          arguments: {
            type: "bar",
            title: "AAPL Trading Volume",
            dataKey: "date",
            description: "Volume data successfully loaded",
            data: createVolumeData(),
            xAxis: "date",
            yAxis: "volume",
            color: "#34C759",
          },
        },
      },
    ]

    await this.stream.sendToolCalls(completedTools, STREAMING_DELAYS.AFTER_TOOL_LONG)

    const responseText =
      "Based on the latest market data, AAPL is currently trading at $150.42, up 2.3% from yesterday's close of $147.05. The stock has shown strong momentum with increased volume."
    await this.stream.sendContent(responseText)
  }

  async handleWeatherRequest(): Promise<void> {
    const loadingTool: ToolCall = {
      id: generateId("call_weather"),
      type: "function",
      state: "loading",
      function: {
        name: "tool-weather",
        arguments: {
          location: "Tokyo, Japan",
          status: "Fetching weather data...",
        },
      },
    }

    await this.stream.sendToolCalls([loadingTool])
    await sleep(STREAMING_DELAYS.TOOL_LOADING)

    const completedTool: ToolCall = {
      id: loadingTool.id,
      type: "function",
      state: "completed",
      function: {
        name: "tool-weather",
        arguments: JSON.stringify({
          location: "Tokyo, Japan",
          units: "celsius",
          temperature: 22,
          conditions: "partly cloudy",
        }),
      },
    }

    await this.stream.sendToolCalls([completedTool])

    const responseText =
      "🌤️ The current weather in Tokyo is 22°C with partly cloudy skies. Humidity is at 65% with light winds from the northeast. Perfect conditions for a walk in the city!"
    await this.stream.sendContent(responseText)
  }

  async handleMixedRequest(): Promise<void> {
    // First tool - search
    const searchLoadingTool: ToolCall = {
      id: generateId("call_search"),
      type: "function",
      state: "loading",
      function: {
        name: "tool-search",
        arguments: {
          query: "latest AI developments 2024",
          status: "Searching for information...",
        },
      },
    }

    await this.stream.sendToolCalls([searchLoadingTool])
    await sleep(600)

    const searchCompletedTool: ToolCall = {
      id: searchLoadingTool.id,
      type: "function",
      state: "completed",
      function: {
        name: "tool-search",
        arguments: JSON.stringify({
          query: "latest AI developments 2024",
          results: ["AI reasoning improvements", "Multimodal capabilities", "Enhanced performance"],
        }),
      },
    }

    await this.stream.sendToolCalls([searchCompletedTool])

    // Intermediate text
    await this.stream.sendContent("Let me analyze the latest information... ", STREAMING_DELAYS.CHAR_TYPING_SLOW)
    await sleep(STREAMING_DELAYS.AFTER_TOOL_LONG)

    // Second tool - chart
    const chartLoadingTool: ToolCall = {
      id: generateId("call_chart"),
      type: "function",
      state: "loading",
      function: {
        name: "tool-chart",
        arguments: {
          type: "area",
          title: "AI Development Trends 2024",
          description: "Generating trend analysis chart...",
        },
      },
    }

    await this.stream.sendToolCalls([chartLoadingTool])
    await sleep(1000)

    const chartCompletedTool: ToolCall = {
      id: chartLoadingTool.id,
      type: "function",
      state: "completed",
      function: {
        name: "tool-chart",
        arguments: {
          type: "area",
          title: "AI Development Trends 2024",
          description: "Chart generated successfully",
          data: createTrendData(),
          xAxis: "month",
          yAxis: "progress",
          color: "#FF9500",
        },
      },
    }

    await this.stream.sendToolCalls([chartCompletedTool])

    const finalText =
      "Based on my analysis, AI development in 2024 has been remarkable, with significant advances in reasoning capabilities and multimodal understanding."
    await this.stream.sendContent(finalText)
  }

  async handleErrorRequest(): Promise<void> {
    const errorTool: ToolCall = {
      id: generateId("call_error"),
      type: "function",
      state: "loading",
      function: {
        name: "tool-chart",
        arguments: {
          title: "Error Test Chart",
          description: "Loading data...",
        },
      },
    }

    await this.stream.sendToolCalls([errorTool])
    await sleep(STREAMING_DELAYS.TOOL_LOADING)

    const erroredTool: ToolCall = {
      id: errorTool.id,
      type: "function",
      state: "error",
      function: {
        name: "tool-chart",
        arguments: {
          title: "Error Test Chart",
          error: "Failed to fetch chart data",
          description: "Unable to load the requested chart data. Please try again.",
        },
      },
    }

    await this.stream.sendToolCalls([erroredTool])
  }

  async handleDefaultRequest(message: string): Promise<void> {
    const responses = [
      ...MOCK_RESPONSES,
      `You said: "${message}". I appreciate you sharing that with me. How can I assist you further?`,
    ]
    const selectedResponse = responses[Math.floor(Math.random() * responses.length)]
    await this.stream.sendContent(selectedResponse, STREAMING_DELAYS.CHAR_TYPING_SLOW)
  }
}

// ============================================================================
// Request Processing
// ============================================================================

const extractConversationId = (pathname: string): string | null => {
  const pathSegments = pathname.split("/")
  return pathSegments.length > 3 ? pathSegments[3] : null
}

const determineRequestType = (message: string): string => {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("stock") || lowerMessage.includes("chart")) {
    return "stock"
  }
  if (lowerMessage.includes("weather")) {
    return "weather"
  }
  if (lowerMessage.includes("mixed")) {
    return "mixed"
  }
  if (lowerMessage.includes("error")) {
    return "error"
  }
  if (lowerMessage.includes("product")) {
    return "product"
  }
  return "default"
}

// ============================================================================
// Main Handlers
// ============================================================================

export async function POST(req: NextRequest): Promise<Response> {
  await sleep(STREAMING_DELAYS.INITIAL)

  try {
    const url = new URL(req.url)
    const conversationId = extractConversationId(url.pathname)
    const isNewConversation = !conversationId

    const { message }: { message: string } = await req.json()

    const stream = new ReadableStream({
      async start(controller) {
        const streamController = new StreamController(controller)
        const responseHandler = new ResponseHandler(streamController)

        try {
          // Handle new conversation ID
          if (isNewConversation) {
            const newConversationId = generateId("conv")
            await streamController.sendConversationId(newConversationId)
          }

          // Send initial content
          const initialText = "Here's the current stock snapshot for Apple Inc. (AAPL):"
          await streamController.sendContent(initialText)

          // Route to appropriate handler
          const requestType = determineRequestType(message)

          switch (requestType) {
            case "stock":
              await responseHandler.handleStockRequest()
              break
            case "weather":
              await responseHandler.handleWeatherRequest()
              break
            case "mixed":
              await responseHandler.handleMixedRequest()
              break
            case "error":
              await responseHandler.handleErrorRequest()
              return // Don't close stream normally for error case
            case "product":
              await responseHandler.handleProductRequest()
              break
            default:
              await responseHandler.handleDefaultRequest(message)
              break
          }

          streamController.close()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error occurred during streaming"
          streamController.sendError(errorMessage)
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
    const errorMessage = error instanceof Error ? error.message : "Failed to process request"
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: "Error occurred while parsing the request or setting up the stream",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

// ============================================================================
// GET Handler
// ============================================================================

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const url = new URL(req.url)
    const pathSegments = url.pathname.split("/")

    if (!pathSegments.includes("conversations")) {
      return new Response(JSON.stringify({ error: "Endpoint not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    const conversationId = pathSegments[pathSegments.length - 1]
    const mockHistory = createMockConversationHistory(conversationId)

    return new Response(JSON.stringify(mockHistory), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return new Response(
      JSON.stringify({
        error: "Failed to load conversation",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

// ============================================================================
// Mock Data for GET Handler
// ============================================================================

const createMockConversationHistory = (conversationId: string) => ({
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
      metadata: { model: "mock-assistant-v1" },
    },
  ],
})
