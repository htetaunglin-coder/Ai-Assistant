import { useQuery } from "@tanstack/react-query"
import { agentClientAPI } from "./client"

export const useAgentList = () => {
  return useQuery({
    queryKey: ["agents"],
    queryFn: agentClientAPI.getAgentList,
  })
}
