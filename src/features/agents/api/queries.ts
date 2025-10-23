import { useQuery } from "@tanstack/react-query"
import { fetchAgents } from "./client"

export const useAgents = () => {
  return useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
  })
}
