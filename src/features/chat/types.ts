export type ChatStatus = "idle" | "loading" | "streaming" | "error"

export type ToolCall = {
  id: string
  name: string
  arguments: any
}

export type MessagePart =
  | { type: "text"; content: string }
  | {
      type: "tool_call"
      tool_call: ToolCall
    }

export type Message = {
  id: string
  message_id: string
  resp_id: string
  role: "user" | "assistant" | "system"
  status: "created" | "in_progress" | "completed" | "error"
  parts: MessagePart[]
  timestamp: Date
  metadata?: Record<string, any>
}
