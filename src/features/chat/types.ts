export interface ToolCall {
  id: string
  type: "function"
  function: {
    name: string
    arguments: string
  }
}

export type MessagePart = { type: "text"; content: string } | { type: "tool_call"; toolCall: ToolCall }

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  parts: MessagePart[]
  timestamp: Date
  metadata?: Record<string, any>
}
