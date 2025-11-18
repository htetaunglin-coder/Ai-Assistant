import { AgentDetailAPIResponse, AgentListAPIResponse } from "../types"
import { MOCK_AGENT_DETAIL, MOCK_AGENT_LIST } from "./mock-data"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Fetch the list of all agents.
 * Simulates a 500ms network delay.
 */
async function getAgentsList(): Promise<AgentListAPIResponse> {
  console.log("[getAgentsList] Fetching agent list...")
  await sleep(500)
  return MOCK_AGENT_LIST
}

/**
 * Fetch detailed information for a single agent by ID.
 * Simulates a 600ms network delay and includes error handling.
 */
async function getAgentDetail(id: string): Promise<AgentDetailAPIResponse> {
  console.log(`[getAgentDetail] Fetching details for agent: ${id}`)
  await sleep(600)

  const detail = MOCK_AGENT_DETAIL[id]

  if (!detail) {
    throw new Error(`Agent with id "${id}" not found`)
  }

  return detail
}

export const agentsServerAPI = {
  getAgentsList,
  getAgentDetail,
}
