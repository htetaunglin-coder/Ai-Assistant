// Helper function to generate dates
export const generateDate = (daysAgo: number, hoursOffset: number = 0, minutesOffset: number = 0): string => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(date.getHours() - hoursOffset)
  date.setMinutes(date.getMinutes() - minutesOffset)
  return date.toISOString()
}

export type AgentItem = { id: string; name: string; role: string }

export const MOCK_AGENTS: AgentItem[] = [
  { id: "agent_1", name: "Sales Bot", role: "Handles product questions" },
  { id: "agent_2", name: "Support Bot", role: "Assists with technical issues" },
]
