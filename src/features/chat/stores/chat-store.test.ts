import { HttpResponse, http } from "msw"
import { setupServer } from "msw/node"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { Message } from "../types"
import { createChatStore, getMessageTextContent } from "./chat-store"

const createMockMessage = (
  conversation_id: string,
  role: "user" | "assistant",
  content: string,
  overrides: Partial<Message> = {},
): Message => ({
  conversation_title: "conversation_title",
  conversation_id,
  message_id: `msg-${conversation_id}`,
  response_id: `resp-${conversation_id}`,
  role,
  parts: [{ type: "text", content }],
  timestamp: "2024-01-01T00:00:00.000Z",
  status: "completed",
  ...overrides,
})

const mockMessages: Message[] = [
  createMockMessage("msg-1", "user", "Hello"),
  createMockMessage("msg-2", "assistant", "Hi there!"),
]

// Response builders
const createStreamingResponse = (chunks: any[]) => {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      chunks.forEach((chunk, index) => {
        setTimeout(() => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
          if (index === chunks.length - 1) {
            controller.close()
          }
        }, index * 10)
      })
    },
  })
}

// Backend Mock data
const createChatChunks = (conversationId = "conv-123") => [
  {
    conversation_id: conversationId,
    response_id: "resp_id-123",
    message_id: "message_id-123",
    type: "text",
    content: "Hello",
    status: "created",
  },
  {
    conversation_id: conversationId,
    response_id: "resp_id-123",
    message_id: "message_id-123",
    type: "text",
    content: " there!",
    status: "completed",
  },
]

const createToolCallChunks = () => [
  {
    conversation_id: "conv-123",
    response_id: "resp_id-123",
    message_id: "message_id-123",
    type: "text",
    content: "Hello there!.",
    status: "created",
  },
  {
    conversation_id: "conv-123",
    response_id: "resp_id-123",
    message_id: "message_id-123",
    type: "tool_call",
    tool_call: { id: "tool-1", name: "search", arguments: '{ "query": "test" }' },
    status: "in_progress",
  },
  {
    conversation_id: "conv-123",
    response_id: "resp_id-123",
    message_id: "message_id-123",
    type: "text",
    content: "Based on the search results...",
    status: "completed",
  },
]

/* -------------------------------------------------------------------------- */
/*                                MSW handlers                                */
/* -------------------------------------------------------------------------- */

const chatHandler = http.post("/api/chat", async ({ request }) => {
  // try to parse JSON body; fall back to undefined if not JSON
  let body: { message?: string; conversation_id?: string } | undefined
  try {
    body = (await request.json()) as { message?: string; conversation_id?: string }
  } catch {
    body = undefined
  }

  // If client provided a conversation_id (continuing a conversation),
  // return the body-aware response used by chatHandler.
  if (body?.conversation_id) {
    const chunks = [
      {
        conversation_id: body.conversation_id,
        response_id: "resp_id-123",
        message_id: "message_id-123",
        type: "text",
        content: `Response to: ${body.message ?? ""}`,
        status: "completed",
      },
    ]

    const stream = createStreamingResponse(chunks)
    return new Response(stream, { headers: { "Content-Type": "text/event-stream" } })
  }

  // Otherwise return the default chat chunks
  const chunks = createChatChunks()
  const stream = createStreamingResponse(chunks)
  return new Response(stream, { headers: { "Content-Type": "text/event-stream" } })
})

const toolCallHandler = http.post("/api/chat/tool-test", async () => {
  const chunks = createToolCallChunks()
  const stream = createStreamingResponse(chunks)
  return new Response(stream, { headers: { "Content-Type": "text/event-stream" } })
})

const errorHandler = http.post("/api/chat/error-test", () =>
  HttpResponse.json({ message: "rejected promise" }, { status: 500 }),
)

const loadChatHandler = http.get("/api/chat/:id", ({ params }) => {
  if (params.id === "existing-conv") {
    return HttpResponse.json({ messages: mockMessages })
  }

  return new HttpResponse(null, { status: 404 })
})

/* -------------------------------------------------------------------------- */
/*                                Server setup                                */
/* -------------------------------------------------------------------------- */

const server = setupServer(chatHandler, toolCallHandler, errorHandler, loadChatHandler)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Test utilities
const waitForAsync = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms))

/* -------------------------------------------------------------------------- */

describe("Chat Store", () => {
  let store: ReturnType<typeof createChatStore>

  beforeEach(() => {
    store = createChatStore()
  })

  describe("Initialization", () => {
    it("initializes with default state", () => {
      const state = store.getState()
      expect(state).toMatchObject({
        messages: [],
        conversationId: null,
        status: "idle",
        error: null,
        retryCountRef: 0,
      })
    })

    it("initializes with provided data", () => {
      const storeWithData = createChatStore({
        initialMessages: mockMessages,
        conversationId: "test-conv",
      })

      const state = storeWithData.getState()
      expect(state.messages).toEqual(mockMessages)
      expect(state.conversationId).toBe("test-conv")
    })
  })

  describe("Message Management", () => {
    it("sets messages", () => {
      store.getState().setMessages(mockMessages)
      expect(store.getState().messages).toEqual(mockMessages)
    })

    it("adds single message", () => {
      store.getState().addMessage(mockMessages[0])
      expect(store.getState().messages).toHaveLength(1)
      expect(store.getState().messages[0]).toEqual(mockMessages[0])
    })

    it("updates last message", () => {
      store.getState().setMessages(mockMessages)
      store.getState().updateLastMessage({ status: "error" })

      const lastMessage = store.getState().messages.at(-1)
      expect(lastMessage?.status).toBe("error")
    })

    it("resets to initial state", () => {
      const { setMessages, setConversationId, setStatus, reset } = store.getState()

      setMessages(mockMessages)
      setConversationId("test-id")
      setStatus("loading")

      reset()

      expect(store.getState()).toMatchObject({
        messages: [],
        conversationId: null,
        status: "idle",
      })
    })
  })

  describe("Message Sending", () => {
    it("sends message, updates optimistically, and receives response", async () => {
      const sendPromise = store.getState().sendMessage("Hello")

      //  Check optimistic state immediately after sending
      const immediateState = store.getState()
      expect(immediateState.messages).toHaveLength(2)
      expect(immediateState.messages[0].role).toBe("user")
      expect(getMessageTextContent(immediateState.messages[0])).toBe("Hello")
      expect(immediateState.messages[1].role).toBe("assistant")
      expect(getMessageTextContent(immediateState.messages[1])).toBe("")
      expect(immediateState.status).toBe("loading")

      await sendPromise
      await waitForAsync(100)

      const { messages, conversationId, status } = store.getState()
      expect(messages).toHaveLength(2)
      expect(messages[1].role).toBe("assistant")
      expect(getMessageTextContent(messages[1])).toBe("Hello there!")
      expect(conversationId).toBe("conv-123")
      expect(status).toBe("idle")
    })

    it("continues existing chat", async () => {
      const storeWithConv = createChatStore({ conversationId: "existing-conv" })

      await storeWithConv.getState().sendMessage("Follow up")
      await waitForAsync()

      const messages = storeWithConv.getState().messages
      expect(messages).toHaveLength(2)
      expect(getMessageTextContent(messages[1])).toBe("Response to: Follow up")
    })

    it("handles send errors and rolls back optimistic updates", async () => {
      const onError = vi.fn()
      const errorStore = createChatStore({
        options: { api: "/api/chat/error-test", onError },
      })

      await errorStore.getState().sendMessage("Test")

      const { status, error, messages } = errorStore.getState()
      expect(status).toBe("error")
      expect(error).toBeInstanceOf(Error)
      expect(messages).toHaveLength(0) // Optimistic messages should be removed
      expect(onError).toHaveBeenCalled()
    })

    it("prevents concurrent sends", async () => {
      const { sendMessage, setStatus } = store.getState()

      // I am pretty sure we don't have to do this explicitly
      setStatus("loading")
      await sendMessage("Test")

      expect(store.getState().status).toBe("loading")
      // No new messages should be added if a send is already in progress
      expect(store.getState().messages).toHaveLength(0)
    })
  })

  describe("Tool Calls", () => {
    it("handles tool calls in response", async () => {
      const onToolCall = vi.fn()
      const toolStore = createChatStore({
        options: { api: "/api/chat/tool-test", onToolCall },
      })

      await toolStore.getState().sendMessage("Use search")
      await waitForAsync(100)

      const assistantMessage = toolStore.getState().messages[1]
      expect(assistantMessage.parts).toHaveLength(3)
      expect(assistantMessage.parts[1].type).toBe("tool_call")
      expect(onToolCall).toHaveBeenCalledWith(
        { id: "tool-1", name: "search", arguments: { query: "test" } },
        expect.any(Object),
      )
    })
  })

  describe("Chat Loading", () => {
    it("loads existing chat", async () => {
      await store.getState().loadChat("existing-conv")

      const { messages, conversationId, status } = store.getState()
      expect(messages).toEqual(mockMessages)
      expect(conversationId).toBe("existing-conv")
      expect(status).toBe("idle")
    })

    it("handles load errors", async () => {
      const onError = vi.fn()
      const errorStore = createChatStore({ options: { onError } })

      await errorStore.getState().loadChat("non-existent")

      expect(errorStore.getState().status).toBe("error")
      expect(onError).toHaveBeenCalled()
    })
  })

  it("doesn't update conversation ID when already set to same value", async () => {
    const existingStore = createChatStore({ conversationId: "conv-123" })

    await existingStore.getState().sendMessage("Hello")
    await waitForAsync(100)

    // Should still be the same conversation ID
    expect(existingStore.getState().conversationId).toBe("conv-123")
  })

  describe("Reload and Reset", () => {
    it("reloads last user message", async () => {
      store.getState().setMessages([mockMessages[0], mockMessages[1]])

      await store.getState().reload()
      await waitForAsync(100)

      const messages = store.getState().messages
      expect(messages).toHaveLength(2)
      expect(messages[0]).toEqual(mockMessages[0])
      expect(getMessageTextContent(messages[1])).toBe("Hello there!")
    })

    it("handles reload when no user message exists", async () => {
      // No messages
      await store.getState().reload()
      expect(store.getState().messages).toHaveLength(0)

      // Loading state
      store.getState().setMessages(mockMessages)
      store.getState().setStatus("loading")
      await store.getState().reload()
      expect(store.getState().messages).toEqual(mockMessages)
    })

    it("stops ongoing requests", () => {
      store.getState().sendMessage("Test")
      store.getState().stop()

      const { status, abortControllerRef, readerRef } = store.getState()
      expect(status).toBe("idle")
      expect(abortControllerRef).toBeNull()
      expect(readerRef).toBeNull()
    })

    it("resets chat completely", () => {
      const { setMessages, setConversationId, resetChat } = store.getState()

      setMessages(mockMessages)
      setConversationId("test-conv")
      resetChat()

      expect(store.getState()).toMatchObject({
        messages: [],
        conversationId: null,
        status: "idle",
        retryCountRef: 0,
      })
    })
  })

  describe("Callbacks", () => {
    it("calls onFinish with the complete message object", async () => {
      const onFinish = vi.fn()
      const callbackStore = createChatStore({ options: { onFinish } })

      await callbackStore.getState().sendMessage("Test")
      await waitForAsync(100)

      expect(onFinish).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "assistant",
          status: "completed",
          parts: expect.arrayContaining([
            expect.objectContaining({
              type: "text",
              content: "Hello there!",
            }),
          ]),
        }),
      )
    })

    it("prioritizes per-message onFinish over global onFinish", async () => {
      const globalOnFinish = vi.fn()
      const messageOnFinish = vi.fn()

      const callbackStore = createChatStore({
        options: { onFinish: globalOnFinish },
      })

      await callbackStore.getState().sendMessage("Test", {
        onFinish: messageOnFinish,
      })

      await waitForAsync(100)

      expect(messageOnFinish).toHaveBeenCalledOnce()
      expect(globalOnFinish).not.toHaveBeenCalled()
    })

    it("falls back to global onFinish when no per-message callback is provided", async () => {
      const globalOnFinish = vi.fn()

      const callbackStore = createChatStore({
        options: { onFinish: globalOnFinish },
      })

      await callbackStore.getState().sendMessage("Test")
      await waitForAsync(100)

      expect(globalOnFinish).toHaveBeenCalledOnce()
    })

    it("prioritizes per-message onError over global onError", async () => {
      const globalOnError = vi.fn()
      const messageOnError = vi.fn()

      const errorStore = createChatStore({
        options: {
          api: "/api/chat/error-test",
          onError: globalOnError,
        },
      })

      await errorStore.getState().sendMessage("Test", {
        onError: messageOnError,
      })

      expect(messageOnError).toHaveBeenCalledOnce()
      expect(globalOnError).not.toHaveBeenCalled()
    })
  })

  describe("Retry Logic", () => {
    it("retries failed requests up to the limit", async () => {
      let callCount = 0
      server.use(
        http.post("/api/chat/retry-test", () => {
          callCount++
          // Fail the first two times, succeed on the third
          if (callCount < 3) {
            return new HttpResponse("Server Error", { status: 500 })
          }
          const stream = createStreamingResponse([{ type: "text", content: "Success after retry" }])
          return new Response(stream, { headers: { "Content-Type": "text/event-stream" } })
        }),
      )

      const retryStore = createChatStore({
        options: { api: "/api/chat/retry-test", maxRetries: 3, retryDelay: 10 },
      })

      await retryStore.getState().sendMessage("Test retry")
      await waitForAsync(200)

      expect(callCount).toBe(3)
      expect(getMessageTextContent(retryStore.getState().messages[1])).toBe("Success after retry")
    })
  })
})
