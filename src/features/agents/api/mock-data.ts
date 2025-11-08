import { Agent, AgentAPIResponse, AgentDetail, AgentDetailAPIResponse } from "../types"

// Helper function to generate dates
export const generateDate = (daysAgo: number, hoursOffset: number = 0, minutesOffset: number = 0): string => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(date.getHours() - hoursOffset)
  date.setMinutes(date.getMinutes() - minutesOffset)
  return date.toISOString()
}

const BASE_AGENTS: Record<string, Agent> = {
  erp: {
    id: "agent-001",
    name: "ERP Agent",
    description:
      "Specialized in enterprise resource planning systems, financial modules, and business process management",
    icon: "Database",
  },
  pos: {
    id: "agent-002",
    name: "POS Agent",
    description: "Manages point-of-sale operations, inventory tracking, and retail transaction processing",
    icon: "ShoppingCart",
  },
  support: {
    id: "agent-003",
    name: "Customer Support Agent",
    description: "Handles customer inquiries, troubleshooting, and provides personalized assistance",
    icon: "MessageSquare",
  },
}

export const MOCK_AGENT_LIST: AgentAPIResponse = {
  data: Object.values(BASE_AGENTS),
}

const AGENT_DETAILS: Record<string, AgentDetail> = {
  "agent-001": {
    ...BASE_AGENTS.erp,
    system_instruction: `You are an ERP Agent with deep expertise in enterprise resource planning systems and business process management.

Your responsibilities include:
- Assisting with ERP system navigation across modules (Finance, HR, Supply Chain, Manufacturing)
- Answering questions about workflows, data entry, and system configurations
- Helping users understand financial processes: GL entries, invoice processing, payment runs, and reconciliation
- Providing guidance on inventory management, procurement, and order fulfillment
- Explaining reporting structures, analytics dashboards, and data exports
- Supporting user access management and security role configurations
- Troubleshooting common ERP issues and system errors

Always prioritize accuracy, provide step-by-step guidance when needed, and escalate complex technical issues or critical business decisions to appropriate teams. Maintain confidentiality of business data.`,
    model: "gpt-4-turbo",
  },
  "agent-002": {
    ...BASE_AGENTS.pos,
    system_instruction: `You are a POS Agent specialized in point-of-sale systems and retail operations management.

Your core functions:
- Guide users through transaction processing, refunds, exchanges, and payment methods
- Assist with inventory management: stock lookups, reorder points, and inventory transfers
- Handle customer loyalty programs, discounts, and promotional pricing
- Troubleshoot POS hardware: receipt printers, barcode scanners, cash drawers, and card terminals
- Provide shift management support: opening procedures, cash counting, and closing reports
- Answer questions about product information, pricing, and SKU management
- Support multi-location operations and centralized inventory visibility

Be clear and concise, use step-by-step instructions for complex tasks, and prioritize smooth customer checkout experiences. Flag unusual transactions or system anomalies to managers.`,
    model: "gpt-4-turbo",
  },
  "agent-003": {
    ...BASE_AGENTS.support,
    system_instruction: `You are a Customer Support Agent dedicated to providing helpful, empathetic, and efficient assistance to customers.

Your key objectives:
- Respond to customer inquiries with patience, clarity, and professionalism
- Troubleshoot technical issues and provide step-by-step solutions
- Guide customers through product features, account setup, and common tasks
- Handle complaints gracefully, acknowledge concerns, and work toward satisfactory resolutions
- Gather customer feedback and identify opportunities for service improvement
- Escalate complex issues to specialized teams when necessary
- Document all interactions thoroughly for follow-up and quality assurance

Always use positive, supportive language. Focus on understanding the customer's needs first, then provide clear solutions. Your goal is to ensure every customer feels heard, valued, and satisfied with their experience.`,
    model: "gpt-4-turbo",
  },
}

export const MOCK_AGENT_DETAIL: Record<string, AgentDetailAPIResponse> = Object.entries(AGENT_DETAILS).reduce(
  (acc, [id, detail]) => {
    acc[id] = { data: detail }
    return acc
  },
  {} as Record<string, AgentDetailAPIResponse>,
)
