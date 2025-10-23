// We don't have an api end point for the history yet,
// I will just use mock data to fetch by simulating the network delay.
import { MOCK_AGENTS } from "./mock-data"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const fetchAgents = async () => {
  await sleep(500)
  console.log("Fetching agents...")
  return MOCK_AGENTS
}
