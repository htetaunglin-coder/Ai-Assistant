export type ToolCall = {
  id: string
  name: string
  status: "created" | "in_progress" | "waiting" | "preparing" | "completed" | "error"
  arguments: Record<string, any> | null
}

export type Artifact = {
  id: string
  name: "text" | "code"
  title: string
  content: string
  language: string
  status: "created" | "in_progress" | "completed" | "error"
  isVisible: boolean
  boundingBox?: {
    top: number
    left: number
    width: number
    height: number
  }
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
  conversation_title: string
  conversation_id: string
  message_id?: string
  response_id?: string
  role: "user" | "assistant" | "system"
  status: "created" | "in_progress" | "completed" | "error"
  parts: MessagePart[]
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export type MessageAPIResponse = {
  data: {
    conversation_title: string
    conversation_id: string
    message_id?: string
    response_id?: string
    role: "user" | "assistant" | "system"
    status: "created" | "in_progress" | "completed" | "error"
    parts: string
    metadata?: Record<string, any>
    created_at?: string
    updated_at?: string
  }[]
  current_page: number
  last_page: number
  per_page: number
  from: number
  to: number
  total: number
  has_more: boolean
}
