import {
  Bot,
  Brain,
  Code,
  Database,
  Headphones,
  LucideIcon,
  MessageSquare,
  Puzzle,
  ShoppingCart,
  Sparkles,
  User,
  Zap,
} from "lucide-react"

const AgentIconMaps = {
  User: {
    icon: <User />,
    label: "User",
  },
  Puzzle: {
    icon: <Puzzle />,
    label: "Puzzle",
  },
  ShoppingCart: {
    icon: <ShoppingCart />,
    label: "Shopping Cart",
  },
  Bot: {
    icon: <Bot />,
    label: "Bot",
  },
  Zap: {
    icon: <Zap />,
    label: "Zap",
  },
  MessageSquare: {
    icon: <MessageSquare />,
    label: "Message Square",
  },
  Database: {
    icon: <Database />,
    label: "Database",
  },
  Code: {
    icon: <Code />,
    label: "Code",
  },
  Sparkles: {
    icon: <Sparkles />,
    label: "Sparkles",
  },
  Brain: {
    icon: <Brain />,
    label: "Brain",
  },
  Headphones: {
    icon: <Headphones />,
    label: "Headphones",
  },
} as const

export type AgentIconName = keyof typeof AgentIconMaps

const AgentIcon = ({ icon }: { icon: AgentIconName } & React.ComponentProps<LucideIcon>) => {
  const Icon = AgentIconMaps[icon].icon
  return Icon ?? <Puzzle />
}

const getAgentIconOptions = () => {
  return Object.entries(AgentIconMaps).map(([key, value]) => ({
    value: key,
    label: value.label,
    icon: value.icon,
  }))
}

export { AgentIconMaps, getAgentIconOptions, AgentIcon }
