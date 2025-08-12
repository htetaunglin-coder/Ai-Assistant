export type ChatStatus = "idle" | "loading" | "streaming" | "error"

export interface ToolCall {
  id: string
  type: "function"
  state: "loading" | "completed" | "error"
  function: {
    name: string
    arguments: any
  }
}

export type MessagePart =
  | { type: "text"; content: string }
  | {
      type: "tool_call"
      toolCall: ToolCall
    }

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  parts: MessagePart[]
  timestamp: Date
  metadata?: Record<string, any>
}
