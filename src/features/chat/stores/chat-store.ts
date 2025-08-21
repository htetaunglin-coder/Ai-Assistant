import { createStore } from "zustand/vanilla"
import { ChatStatus, Message, MessagePart, ToolCall } from "../types"

export type ChatOptions = {
  api?: string
  headers?: Record<string, string>
  body?: Record<string, any>
  onError?: (error: Error) => void
  onFinish?: (message: Message) => void
  onToolCall?: (toolCall: ToolCall, message: Message) => void
  maxRetries?: number
  retryDelay?: number
}

export type ChatStoreState = {
  messages: Message[]
  conversationId: string | null
  status: ChatStatus
  error: Error | null
  input: string

  options: ChatOptions
  abortControllerRef: AbortController | null
  readerRef: ReadableStreamDefaultReader | null
  retryCountRef: number

  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  updateLastMessage: (updates: Partial<Message>) => void
  setConversationId: (id: string | null) => void
  setStatus: (status: ChatStoreState["status"]) => void
  setError: (error: Error | null) => void
  setInput: (input: string) => void
  reset: (messages?: Message[], conversationId?: string | null) => void

  handleSubmit: (
    e: React.FormEvent,
    chatRequestOptions?: {
      data?: Record<string, any>
    },
  ) => Promise<void>
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  append: (message: Omit<Message, "id" | "timestamp">) => Promise<void>
  reload: () => Promise<void>
  stop: () => void
  loadConversation: (id: string) => Promise<void>
  resetChat: () => void

  sendChatRequest: (
    message: string,
    additionalData?: Record<string, any>,
    userMessage?: Message,
    assistantMessage?: Message,
  ) => Promise<void>
}

export type ChatStoreProps = {
  initialMessages?: Message[]
  conversationId?: string | null
  options?: ChatOptions
}

export const createChatStore = (initProps?: ChatStoreProps) => {
  const DEFAULT_PROPS: Required<Pick<ChatStoreProps, "initialMessages" | "conversationId">> & { options: ChatOptions } =
    {
      initialMessages: [],
      conversationId: null,
      options: {},
    }

  const props = {
    initialMessages: initProps?.initialMessages ?? DEFAULT_PROPS.initialMessages,
    conversationId: initProps?.conversationId ?? DEFAULT_PROPS.conversationId,
    options: {
      ...DEFAULT_PROPS.options,
      ...initProps?.options,
    },
  }

  const {
    api = "/api/chat",
    headers = {},
    body = {},
    onError,
    onFinish,
    onToolCall,
    maxRetries = 3,
    retryDelay = 1000,
  } = props.options

  return createStore<ChatStoreState>()((set, get) => ({
    // Initial state
    messages: props.initialMessages,
    conversationId: props.conversationId,
    status: "idle",
    error: null,
    input: "",
    options: props.options,
    abortControllerRef: null,
    readerRef: null,
    retryCountRef: 0,

    setMessages: (messages) => set({ messages }),

    addMessage: (message) =>
      set((state) => ({
        messages: [...state.messages, message],
      })),

    updateLastMessage: (updates) =>
      set((state) => ({
        messages: state.messages.map((msg, index) =>
          index === state.messages.length - 1 ? { ...msg, ...updates } : msg,
        ),
      })),

    setConversationId: (conversationId) => set({ conversationId }),
    setStatus: (status) => set({ status }),
    setError: (error) => set({ error }),
    setInput: (input) => set({ input }),

    reset: (messages = [], conversationId = null) =>
      set({
        messages,
        conversationId,
        status: "idle",
        error: null,
        input: "",
      }),

    handleInputChange: (e) => {
      set({ input: e.target.value })
    },

    handleSubmit: async (e, chatRequestOptions) => {
      e.preventDefault()

      const { input, status, sendChatRequest, messages, setInput, setError, setStatus, addMessage, setMessages } = get()

      if (!input.trim() || status === "loading" || status === "streaming") return

      const messageContent = input.trim()

      // Optimistic UI updates - add messages immediately
      const userMessage = createMessage("user", messageContent)
      const assistantMessage = createMessage("assistant")

      setInput("")
      setError(null)
      setStatus("loading")
      addMessage(userMessage)
      addMessage(assistantMessage)

      try {
        await sendChatRequest(messageContent, chatRequestOptions?.data, userMessage, assistantMessage)
      } catch (error) {
        const err = error as Error
        setError(err)
        setStatus("error")
        onError?.(err)
        console.error(error)
        setInput(messageContent) // Restore input on error

        const messagesToKeep = messages.slice(0, -2)
        setMessages(messagesToKeep)
      }
    },

    append: async (message) => {
      const { status, sendChatRequest, addMessage, setError, setStatus, messages, setMessages } = get()

      if (status === "loading" || status === "streaming") return

      // Create proper message structure
      const userMessage = createMessage(message.role as "user" | "assistant" | "system", undefined, message)
      const assistantMessage = createMessage("assistant")

      setError(null)
      setStatus("loading")
      addMessage(userMessage)
      addMessage(assistantMessage)

      try {
        // Extract text content from parts for API call
        const textContent = extractTextFromParts(userMessage.parts)
        await sendChatRequest(textContent, undefined, userMessage, assistantMessage)
      } catch (error) {
        const err = error as Error
        setError(err)
        setStatus("error")
        onError?.(err)

        // Remove optimistically added messages on error
        const messagesToKeep = messages.slice(0, -2)
        setMessages(messagesToKeep)
      }
    },

    reload: async () => {
      const { status, messages, sendChatRequest, setMessages, setError, setStatus } = get()

      if (status === "loading" || status === "streaming" || messages.length === 0) return

      // Find last user message
      const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")

      if (!lastUserMessage) return

      // Keep messages up to last user message, add new assistant message
      const lastUserIndex = messages.findIndex((m) => m.id === lastUserMessage.id)
      const messagesToKeep = messages.slice(0, lastUserIndex + 1)
      const newAssistantMessage = createMessage("assistant")

      setMessages([...messagesToKeep, newAssistantMessage])
      setError(null)
      setStatus("loading")

      try {
        // Extract text content from the last user message parts
        const textContent = extractTextFromParts(lastUserMessage.parts)
        await sendChatRequest(textContent, undefined, lastUserMessage, newAssistantMessage)
      } catch (error) {
        const err = error as Error
        setError(err)
        setStatus("error")
        onError?.(err)
        setMessages(messages) // Restore original messages
      }
    },

    stop: () => {
      const { abortControllerRef, readerRef } = get()

      if (abortControllerRef) {
        abortControllerRef.abort()
        set({
          abortControllerRef: null,
        })
      }

      if (readerRef) {
        readerRef.cancel()
        set({ readerRef: null })
      }

      set({ status: "idle" })
    },

    resetChat: () => {
      const { stop, reset } = get()
      stop()
      reset([], null)
      set({ retryCountRef: 0 })
    },

    loadConversation: async (id) => {
      const { setStatus, setError, setMessages, setConversationId } = get()

      setStatus("loading")
      setError(null)

      try {
        const response = await fetch(`${api}/${id}`, {
          headers: { ...headers },
        })

        if (!response.ok) {
          throw new Error(`Failed to load conversation: ${response.statusText}`)
        }

        const data = await response.json()
        setMessages(data.messages || [])
        setConversationId(id)
        setStatus("idle")
      } catch (error) {
        const err = error as Error
        setError(err)
        setStatus("error")
        onError?.(err)
      }
    },

    sendChatRequest: async (message, additionalData, userMessage, assistantMessage) => {
      const { conversationId } = get()
      const endpoint = conversationId ? `${api}/${conversationId}` : api

      const payload = {
        message,
        ...body,
        ...additionalData,
      }

      const response = await makePostRequestWithRetries(endpoint, payload, {
        headers,
        maxRetries,
        retryDelay,
        get,
        set,
      })

      await processStream(response, userMessage, assistantMessage, {
        get,
        set,
        onFinish,
        onToolCall,
      })
    },
  }))
}

// Helper functions
const makePostRequestWithRetries = async (
  endpoint: string,
  payload: any,
  options: {
    headers: Record<string, string>
    maxRetries: number
    retryDelay: number
    get: () => ChatStoreState
    set: (partial: Partial<ChatStoreState>) => void
  },
): Promise<Response> => {
  const { headers, maxRetries, retryDelay, set } = options
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const abortController = new AbortController()
      set({
        abortControllerRef: abortController,
      })

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(payload),
        signal: abortController.signal,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      if (!response.body) {
        throw new Error("Response body is empty")
      }

      set({ retryCountRef: 0 })
      return response
    } catch (error) {
      lastError = error as Error

      // Don't retry if request was cancelled
      if (error instanceof Error && error.name === "AbortError") {
        throw error
      }

      // Retry with exponential backoff
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)))
        set({
          retryCountRef: attempt + 1,
        })
      }
    }
  }

  throw lastError!
}

const processStream = async (
  response: Response,
  userMessage?: Message,
  assistantMessage?: Message,
  context?: {
    get: () => ChatStoreState
    set: (partial: Partial<ChatStoreState>) => void
    onFinish?: (message: Message) => void
    onToolCall?: (toolCall: ToolCall, message: Message) => void
  },
): Promise<void> => {
  if (!context) throw new Error("Context required for processStream")

  const { get, set, onFinish, onToolCall } = context

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error("Response body is not readable")
  }

  set({ readerRef: reader })
  const decoder = new TextDecoder()
  let buffer = ""

  // Use provided assistant message or create new one
  const currentAssistantMessage = assistantMessage || createMessage("assistant")

  set({ status: "streaming" })

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      // Process chunks
      buffer += decoder.decode(value, {
        stream: true,
      })
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      // Handle each line
      for (const line of lines) {
        if (!line.trim()) continue

        const parsed = parseStreamChunk(line)
        if (!parsed) continue

        handleStreamResponse(parsed, currentAssistantMessage, { get, set, onToolCall })
      }
    }

    // Finalize message
    currentAssistantMessage.timestamp = new Date()
    const { updateLastMessage, setStatus } = get()
    updateLastMessage({
      timestamp: currentAssistantMessage.timestamp,
    })
    setStatus("idle")
    onFinish?.(currentAssistantMessage)
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return // Request was cancelled
    }
    throw error
  } finally {
    // Cleanup
    set({ readerRef: null })
  }
}

const handleStreamResponse = (
  parsed: any,
  assistantMessage: Message,
  context: {
    get: () => ChatStoreState
    set: (partial: Partial<ChatStoreState>) => void
    onToolCall?: (toolCall: ToolCall, message: Message) => void
  },
) => {
  const { get, onToolCall } = context
  const { conversationId, setConversationId, updateLastMessage } = get()

  if (parsed.status === "created") {
    if (!conversationId && conversationId !== parsed.id) setConversationId(parsed.id)
  }

  switch (parsed.type) {
    case "text": {
      const textContent = parsed.content || ""
      const lastPart = assistantMessage.parts.at(-1)

      // Always replace content since backend sends cumulative text
      if (lastPart?.type === "text") {
        if (parsed.status === "completed") {
          lastPart.content = textContent
        } else {
          lastPart.content += textContent
        }
      } else {
        assistantMessage.parts.push({
          type: "text",
          content: textContent,
        })
      }

      // Update message status based on parsed status
      assistantMessage.status = parsed.status

      updateLastMessage({
        id: assistantMessage.id,
        message_id: assistantMessage.message_id,
        resp_id: assistantMessage.resp_id,
        status: assistantMessage.status,
        role: "assistant",
        parts: [...assistantMessage.parts],
      })
      break
    }

    case "tool_call": {
      const toolCall = parsed.tool_call

      if (toolCall) {
        const existingPartIndex = assistantMessage.parts.findIndex(
          (part) => part.type === "tool_call" && part.tool_call?.id === toolCall.id,
        )

        if (existingPartIndex !== -1) {
          const existingPart = assistantMessage.parts[existingPartIndex]
          if (existingPart.type === "tool_call" && existingPart.tool_call) {
            assistantMessage.parts[existingPartIndex] = {
              type: "tool_call",
              tool_call: {
                ...existingPart.tool_call,
                ...toolCall,
                arguments: {
                  ...existingPart.tool_call.arguments,
                  ...toolCall.arguments,
                },
              },
            }
          }
        } else {
          assistantMessage.parts.push({
            type: "tool_call",
            tool_call: toolCall,
          })
        }

        // Call the callback for each tool call
        onToolCall?.(toolCall, assistantMessage)
      }

      // Update message status
      assistantMessage.status = parsed.status || assistantMessage.status

      updateLastMessage({
        id: assistantMessage.id,
        message_id: assistantMessage.message_id,
        resp_id: assistantMessage.resp_id,
        status: assistantMessage.status,
        role: "assistant",
        parts: [...assistantMessage.parts],
      })
      break
    }

    case "error": {
      // Update message status to error and preserve any existing content
      assistantMessage.status = "error"

      updateLastMessage({
        id: assistantMessage.id,
        message_id: assistantMessage.message_id,
        resp_id: assistantMessage.resp_id,
        status: "error",
        role: "assistant",
        parts: [...assistantMessage.parts],
      })

      throw new Error(parsed.message || "Streaming error")
    }

    default: {
      console.warn("Unknown stream type:", parsed.type, parsed)
      break
    }
  }
}

const parseStreamChunk = (chunk: string) => {
  try {
    if (chunk.startsWith("data: ")) {
      const data = chunk.slice(6)
      if (data === "[DONE]") return null
      return JSON.parse(data)
    }
    return JSON.parse(chunk)
  } catch {
    return null
  }
}

const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

const createMessage = (
  role: "user" | "assistant" | "system",
  initialContent?: string,
  overrides?: Partial<Message>,
): Message => ({
  id: generateId(),
  message_id: generateId(),
  resp_id: generateId(),
  role,
  parts: initialContent
    ? [
        {
          type: "text",
          content: initialContent,
        },
      ]
    : [],
  timestamp: new Date(),
  status: overrides?.status ?? "created",
  ...overrides,
})

/**
 * Extracts text content from message parts, combining all text parts
 */
const extractTextFromParts = (parts: MessagePart[]): string => {
  return parts
    .filter(
      (
        part,
      ): part is MessagePart & {
        type: "text"
      } => part.type === "text",
    )
    .map((part) => part.content)
    .join("")
}

/**
 * Gets the current text content from a message for display purposes
 */
export const getMessageTextContent = (message: Message): string => {
  return extractTextFromParts(message.parts)
}

/**
 * Gets all tool calls from a message
 */
export const getMessageToolCalls = (message: Message): ToolCall[] => {
  return message.parts
    .filter(
      (
        part,
      ): part is MessagePart & {
        type: "tool_call"
      } => part.type === "tool_call",
    )
    .map((part) => part.tool_call)
}
