import { LucideIcon, Puzzle, ShoppingCart, User } from "lucide-react"

// Helper function to generate dates
export const generateDate = (daysAgo: number, hoursOffset: number = 0, minutesOffset: number = 0): string => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(date.getHours() - hoursOffset)
  date.setMinutes(date.getMinutes() - minutesOffset)
  return date.toISOString()
}

export type AgentItem = { id: string; name: string; role: string }

export interface Agent {
  id: string
  name: string
  description: string
  icon: LucideIcon
  systemPrompt: string
  model: string
  contextFiles: string[]
}

export const MOCK_AGENTS: Agent[] = [
  {
    id: "agent-001",
    name: "ERP Assistant",
    description: "Handles enterprise resource planning queries",
    systemPrompt: "You are an AI assistant specialized in ERP systems...",
    icon: Puzzle,
    model: "gpt-4o-mini",
    contextFiles: [],
  },
  {
    id: "agent-002",
    name: "POS Manager",
    description: "Manages point of sale operations",
    icon: ShoppingCart,
    systemPrompt: "You are an AI assistant for POS systems...",
    model: "gpt-4-turbo",
    contextFiles: ["pos-training.pdf"],
  },
  {
    id: "agent-003",
    name: "Customer Support",
    description: "Provides customer support and assistance",
    icon: User,
    systemPrompt: "You are a helpful customer support agent...",
    model: "gpt-4o-mini",
    contextFiles: ["faq.md", "policies.txt"],
  },
]
