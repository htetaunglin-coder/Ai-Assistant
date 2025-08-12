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

  isBusy: boolean

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

export interface ChatStoreProps {
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

    get isBusy() {
      const { status } = get()
      return status === "loading" || status === "streaming"
    },

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

      const { input, isBusy, sendChatRequest, messages, setInput, setError, setStatus, addMessage, setMessages } = get()

      if (!input.trim() || isBusy) return

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
        setInput(messageContent) // Restore input on error

        const messagesToKeep = messages.slice(0, -2) // Remove last 2 messages
        setMessages(messagesToKeep)
      }
    },

    append: async (message) => {
      const { isBusy, sendChatRequest, addMessage, setError, setStatus, messages, setMessages } = get()

      if (isBusy) return

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
      const { isBusy, messages, sendChatRequest, setMessages, setError, setStatus } = get()

      if (isBusy || messages.length === 0) return

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
        const conversationApi = api.replace("/chat", "/conversations")
        const response = await fetch(`${conversationApi}/${id}`, {
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
      const endpoint = conversationId ? `${api}/` : api

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
  const { setConversationId, updateLastMessage } = get()

  switch (parsed.type) {
    case "content": {
      const textContent = parsed.content || ""

      const lastPart = assistantMessage.parts.at(-1)
      if (lastPart?.type === "text") {
        lastPart.content += textContent
      } else {
        assistantMessage.parts.push({
          type: "text",
          content: textContent,
        })
      }

      updateLastMessage({
        parts: [...assistantMessage.parts],
      })
      break
    }

    case "tool_calls": {
      const newToolCalls = parsed.tool_calls || []

      newToolCalls.forEach((toolCall: ToolCall) => {
        // Check if this tool call already exists (by ID)
        const existingPartIndex = assistantMessage.parts.findIndex(
          (part) => part.type === "tool_call" && part.toolCall?.id === toolCall.id,
        )

        if (existingPartIndex !== -1) {
          // Replace existing tool call (loading -> completed/error)
          const existingPart = assistantMessage.parts[existingPartIndex]

          if (existingPart.type === "tool_call" && existingPart.toolCall) {
            // Update the existing tool call with new state
            assistantMessage.parts[existingPartIndex] = {
              type: "tool_call",
              toolCall: {
                ...existingPart.toolCall,
                ...toolCall,
                // Preserve any additional properties from the original
                function: {
                  ...existingPart.toolCall.function,
                  ...toolCall.function,
                },
              },
            }
          }
        } else {
          // Add new tool call
          const toolCallPart: MessagePart = {
            type: "tool_call",
            toolCall,
          }
          assistantMessage.parts.push(toolCallPart)
        }

        onToolCall?.(toolCall, assistantMessage)
      })

      updateLastMessage({
        parts: [...assistantMessage.parts],
      })
      break
    }

    case "conversation_id": {
      setConversationId(parsed.conversation_id)
      break
    }

    case "error": {
      throw new Error(parsed.message || "Streaming error")
    }

    default:
      console.warn("Unknown stream type:", parsed.type)
      break
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
    .map((part) => part.toolCall)
}
