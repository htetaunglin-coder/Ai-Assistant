import { authClientAPI } from "@/lib/auth/client"
import { AgentAPIResponse } from "../types"

async function getAgentList(): Promise<AgentAPIResponse> {
  return authClientAPI.fetchWithAuth<AgentAPIResponse>(`/api/agents`, {
    method: "GET",
  })
}

export const agentClientAPI = {
  getAgentList,
}
