import { Message, ToolCall } from "../../types"
import { StatusDisplay } from "../ui/status-display"
import { ChartPreview } from "./chart"
import ImageViewer from "./image-viewer"
import { ProductCards } from "./product-card"
import { ToolCallStatus } from "./tool-call-status"

const ToolCallPreview = ({ tool, status }: { tool: ToolCall; status: Message["status"] }) => {
  if (status === "error") {
    return (
      <StatusDisplay key={tool.id} status="error" title="Error!" description="Something Went Wrong! Please try again" />
    )
  }

  switch (tool.name) {
    case "":
    case "chart":
      return <ChartPreview tool={tool} key={tool.id} />
    case "product_card":
      return <ProductCards tool={tool} key={tool.id} />
    case "image_preview":
      return <ImageViewer tool={tool} key={tool.id} />
    case "status_display":
      return <ToolCallStatus tool={tool} key={tool.id} />
    default:
      return <StatusDisplay status="error" title="This tool hasn't been implemeted in the frontend." />
  }
}

export { ToolCallPreview }
