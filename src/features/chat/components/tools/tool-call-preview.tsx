import { AlertCircle } from "lucide-react"
import { Message, ToolCall } from "../../types"
import { ChartPreview } from "./chart"
import { ProductCards } from "./product-card"
import { ToolCallStatusDisplay } from "./tool-call-status-display"

const ToolCallPreview = ({ tool, status }: { tool: ToolCall; status: Message["status"] }) => {
  if (status === "error") {
    return (
      <ToolCallStatusDisplay
        key={tool.id}
        status="error"
        icon={AlertCircle}
        title="Error!"
        description="Something Went Wrong! Please try again"
      />
    )
  }

  switch (tool.name) {
    case "chart":
      return (
        <div key={tool.id}>
          <ChartPreview loading={status === "in_progress"} tool={tool} />
        </div>
      )
    case "product_card":
      return (
        <div key={tool.id}>
          <ProductCards loading={status === "in_progress"} tool={tool} />
        </div>
      )
    default:
      return (
        <ToolCallStatusDisplay
          icon={AlertCircle}
          status="error"
          title="This tool hasn't been implemeted in the frontend."
        />
      )
  }
}

export { ToolCallPreview }
