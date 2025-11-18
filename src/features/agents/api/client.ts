import { authClientAPI } from "@/lib/auth/client"
import { AgentListAPIResponse } from "../types"

async function getAgentList(): Promise<AgentListAPIResponse> {
  return authClientAPI.fetchWithAuth<AgentListAPIResponse>(`/api/agents`, {
    method: "GET",
  })
}

export const agentClientAPI = {
  getAgentList,
}
