export type ChatStatus = "idle" | "loading" | "streaming" | "error"

export type ToolCall = {
  id: string
  name: string
  // The `null` type is included here because the arguments received from the backend are currently
  // provided as a string instead of an object. If an error occurs while attempting to parse the string
  // into JSON on the frontend, the value will be set to `null` as a fallback.
  arguments: Record<string, any> | null

  // Toolcall should also have it's own status..
  // status: "created" | "in_progress" | "completed" | "error"
}

export type Artifact = {
  id: string
  name: "text" | "code"
  title: string
  content: string
  language: string
  status: "created" | "in_progress" | "completed" | "error"
}

export type MessagePart =
  | { type: "text"; content: string }
  | {
      type: "tool_call"
      tool_call: ToolCall
    }
  | {
      type: "artifact"
      artifact: Omit<Artifact, "content">
    }

export type Message = {
  id: string
  message_id: string
  resp_id: string
  role: "user" | "assistant" | "system"
  status: "created" | "in_progress" | "completed" | "error"
  parts: MessagePart[]
  timestamp: string
  metadata?: Record<string, any>
}
