import { Message, ToolCall } from "../../types"
import { StatusDisplay } from "../ui/status-display"
import { ChartPreview } from "./chart"
import { ProductCards } from "./product-card"

const ToolCallPreview = ({ tool, status }: { tool: ToolCall; status: Message["status"] }) => {
  if (status === "error") {
    return (
      <StatusDisplay key={tool.id} status="error" title="Error!" description="Something Went Wrong! Please try again" />
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
      return <StatusDisplay status="error" title="This tool hasn't been implemeted in the frontend." />
  }
}

export { ToolCallPreview }
