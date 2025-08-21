import { BarChart3, Database, FileText, Package, RotateCcw, Search } from "lucide-react"
import { Message, ToolCall } from "../../types"
import { ChartPreview } from "./chart"
import { ProductCards } from "./product-card"

const ToolCallPreview = ({ tool, status }: { tool: ToolCall; status: Message["status"] }) => {
  if (status === "error") {
    return (
      <div
        key={tool.id}
        className="relative rounded-md border border-border-danger-subtle bg-danger-subtle px-4 py-2 dark:bg-danger-subtle/40">
        <p className="text-sm font-semibold text-danger-emphasis">Error!</p>
        <p className="text-[0.815rem] text-danger-foreground-subtle">Something Went Wrong! Please try again</p>
        <button className="absolute right-0 top-0 inline-flex items-center gap-1.5 rounded-md p-4 text-sm text-danger-foreground-subtle">
          <p>Retry</p> <RotateCcw className="mt-0.5" />
        </button>
      </div>
    )
  }

  if (status === "in_progress") {
    return <ToolCallLoading tool={tool} key={tool.id} />
  }

  switch (tool.name) {
    case "chart":
      return (
        <div key={tool.id}>
          <ChartPreview tool={tool} />
        </div>
      )
    case "product_card":
      return (
        <div key={tool.id}>
          <ProductCards tool={tool} />
        </div>
      )
    default:
      return <div className="text-red-500">Tool not registered</div>
  }
}

export { ToolCallPreview }

const TOOL_LOADING_CONFIGS = {
  chart: {
    icon: BarChart3,
    title: "Generating Chart",
    description: "Creating visualization from your data...",
  },
  product_card: {
    icon: Package,
    title: "Loading Products",
    description: "Fetching product information...",
  },
  database_query: {
    icon: Database,
    title: "Querying Database",
    description: "Running database query...",
  },
  web_search: {
    icon: Search,
    title: "Searching Web",
    description: "Finding relevant information online...",
  },
  document_analysis: {
    icon: FileText,
    title: "Analyzing Document",
    description: "Processing document content...",
  },
} as const

const ToolCallLoading = ({ tool }: { tool: ToolCall }) => {
  const config = TOOL_LOADING_CONFIGS[tool.name as keyof typeof TOOL_LOADING_CONFIGS] || {
    icon: FileText,
    title: "Processing",
    description: "Working on your request...",
  }

  const Icon = config.icon

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background-alt p-4">
      <div className="shrink-0">
        <Icon className="size-5 text-primary-emphasis" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{config.title}</p>
        <p className="text-sm text-secondary-foreground">{config.description}</p>
      </div>
      <div className="shrink-0">
        <div className="size-4 animate-spin rounded-full border-2 border-border-primary border-t-transparent" />
      </div>
    </div>
  )
}
