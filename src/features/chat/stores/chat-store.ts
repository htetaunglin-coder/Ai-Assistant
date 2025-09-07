import { createStore } from "zustand/vanilla"
import { Artifact, ChatStatus, Message, MessagePart, ToolCall } from "../types"

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
  artifact: Artifact | null
  conversationId: string | null
  status: ChatStatus
  error: Error | null

  options: ChatOptions
  abortControllerRef: AbortController | null
  readerRef: ReadableStreamDefaultReader | null
  retryCountRef: number

  setMessages: (messages: Message[]) => void
  setArtifact: (artifact: Artifact | null) => void
  addMessage: (message: Message) => void
  updateLastMessage: (updates: Partial<Message>) => void
  setConversationId: (id: string | null) => void
  setStatus: (status: ChatStoreState["status"]) => void
  setError: (error: Error | null) => void
  reset: (messages?: Message[], conversationId?: string | null) => void

  sendMessage: (message: string) => Promise<void>
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
    artifact: null,
    conversationId: props.conversationId,
    status: "idle",
    error: null,
    options: props.options,
    abortControllerRef: null,
    readerRef: null,
    retryCountRef: 0,

    setMessages: (messages) => set({ messages }),

    setArtifact: (artifact) => set({ artifact }),

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

    reset: (messages = [], conversationId = null) =>
      set({
        messages,
        conversationId,
        status: "idle",
        error: null,
      }),

    sendMessage: async (message) => {
      const { status, sendChatRequest, addMessage, setError, setStatus, messages, setMessages } = get()

      if (status === "loading" || status === "streaming") return

      // Create proper message structure
      const userMessage = createMessage("user", message)
      const assistantMessage = createMessage("assistant")

      setError(null)
      setStatus("loading")
      addMessage(userMessage)
      addMessage(assistantMessage)

      try {
        const textContent = extractTextFromParts(userMessage.parts)

        await sendChatRequest(textContent, undefined, userMessage, assistantMessage)
      } catch (error) {
        const err = error as Error
        setStatus("error")
        setError(err)
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
    currentAssistantMessage.timestamp = new Date().toISOString()
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
  const { updateLastMessage, artifact, setArtifact } = get()

  // The backend does not yet support handling chat continuation responses.
  // For now, this behavior is disabled by commenting out the related code.
  // if (parsed.status === "created") {
  //   if (!conversationId && conversationId !== parsed.id) setConversationId(parsed.id)
  // }

  switch (parsed.type) {
    case "text": {
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
        id: parsed.id,
        message_id: parsed.message_id,
        resp_id: parsed.response_id,
        status: parsed.status,
        role: parsed?.role || "assistant",
        parts: [...assistantMessage.parts],
      })
      break
    }

    case "tool_call": {
      const toolCall = parseToolCall(parsed.tool_call)
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

      updateLastMessage({
        id: parsed.id,
        message_id: parsed.message_id,
        resp_id: parsed.response_id,
        status: parsed.status,
        role: parsed?.role || "assistant",
        parts: [...assistantMessage.parts],
      })
      break
    }
    case "artifact": {
      const newArtifact = parsed.artifact

      if (!newArtifact) {
        setArtifact(null)
        break
      }

      const currentArtifact = artifact
      let updatedArtifact: Artifact

      if (currentArtifact && currentArtifact.id === newArtifact.id) {
        updatedArtifact = {
          ...currentArtifact,
          content: currentArtifact.content + (newArtifact.content || ""),
          title: newArtifact.title || currentArtifact.title,
          name: newArtifact.name || currentArtifact.name,
          language: newArtifact.language || currentArtifact.language,
          status: newArtifact.status || currentArtifact.status || "in_progress",
        }
      } else {
        updatedArtifact = {
          id: newArtifact.id,
          name: newArtifact.name || "",
          title: newArtifact.title || "",
          content: newArtifact.content || "",
          language: newArtifact.language || "text",
          status: newArtifact.status || "in_progress",
          isVisible: false,
        }
      }

      setArtifact(updatedArtifact)

      // Handle artifact reference in message parts
      const artifactRefIndex = assistantMessage.parts.findIndex(
        (part) => part.type === "artifact" && part.artifact?.id === newArtifact.id,
      )

      const artifactRef = {
        id: updatedArtifact.id,
        name: updatedArtifact.name,
        title: updatedArtifact.title,
        language: updatedArtifact.language,
        status: updatedArtifact.status,
        isVisible: false,
      }

      if (artifactRefIndex !== -1) {
        // Update existing artifact reference
        assistantMessage.parts[artifactRefIndex] = {
          type: "artifact",
          artifact: artifactRef,
        }
      } else {
        // Add new artifact reference to message
        assistantMessage.parts.push({
          type: "artifact",
          artifact: artifactRef,
        })
      }

      updateLastMessage({
        id: parsed.id,
        message_id: parsed.message_id,
        resp_id: parsed.response_id,
        status: parsed.status,
        role: parsed?.role || "assistant",
        parts: [...assistantMessage.parts],
      })

      break
    }

    case "error": {
      updateLastMessage({
        id: parsed.id,
        message_id: parsed.message_id,
        resp_id: parsed.response_id,
        status: "error",
        role: parsed?.role || "assistant",
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
  return `temp_${Math.random().toString(36).substring(2) + Date.now().toString(36)}`
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
  timestamp: new Date().toISOString(),
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

// Temporary solution to handle tool_call arguments.
// The backend currently returns arguments as a string
// instead of a JSON object. This utility function is used
// to fix that issue for now. (We should discuss this later.)
function parseToolCall(rawToolCall: any): ToolCall | null {
  if (!rawToolCall || !rawToolCall.id || !rawToolCall.name) {
    console.warn("Invalid tool call data:", rawToolCall)
    return {
      id: rawToolCall?.id || "unknown",
      name: rawToolCall?.name || "unknown",
      arguments: null,
    }
  }

  let parsedArgs: Record<string, any> | null = null
  if (typeof rawToolCall.arguments === "string") {
    if (rawToolCall.arguments === "") {
      return {
        id: rawToolCall.id,
        name: rawToolCall.name,
        arguments: null, // Loading state
      }
    }
    try {
      parsedArgs = JSON.parse(rawToolCall.arguments)
    } catch (error) {
      console.error(`Failed to parse arguments for tool ${rawToolCall.name}:`, error)
      console.error("Raw arguments:", rawToolCall.arguments)
      return {
        id: rawToolCall.id,
        name: rawToolCall.name,
        arguments: null, // Parse failure
      }
    }
  } else {
    parsedArgs = rawToolCall.arguments || null // Pre-parsed or missing
  }

  return {
    id: rawToolCall.id,
    name: rawToolCall.name,
    arguments: parsedArgs,
  }
}
