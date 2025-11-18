export type AgentIconType =
  | "User"
  | "Puzzle"
  | "Bot"
  | "Zap"
  | "Database"
  | "Code"
  | "Sparkles"
  | "Brain"
  | "ShoppingCart"
  | "MessageSquare"
  | "Headphones"

export type Agent = {
  id: string
  name: string
  description: string
  icon: AgentIconType
}

export type AgentListAPIResponse = {
  data: Agent[]
}

export type AgentDetail = Agent & {
  system_instruction: string
  model: string
}

export type AgentDetailAPIResponse = {
  data: AgentDetail
}
