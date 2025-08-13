import React from "react"
import { RotateCcw } from "lucide-react"
import { ToolCall } from "../../types"
import { ChartPreview } from "./chart"
import { ProductCards } from "./product-card"

const ToolCallPreview = ({ tool }: { tool: ToolCall }) => {
  if (tool.state === "error") {
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

  if (tool.state === "loading") {
    return (
      <div key={tool.id} className="flex items-center rounded-md border bg-background p-4">
        <div className="size-4 animate-spin rounded-full border-t-2 border-blue-500"></div>
        <p className="ml-2 text-sm text-secondary-foreground">Loading...</p>
      </div>
    )
  }

  switch (tool.function.name) {
    case "tool-chart":
      return (
        <div key={tool.id}>
          <ChartPreview tool={tool} />
        </div>
      )
    case "tool-products":
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
