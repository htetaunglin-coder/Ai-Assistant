export type Agent = {
  id: string
  name: string
  description: string
  icon: string
}

export type AgentAPIResponse = {
  data: Agent[]
}

export type AgentDetail = Agent & {
  system_instruction: string
  model: string
}

export type AgentDetailAPIResponse = {
  data: AgentDetail
}
