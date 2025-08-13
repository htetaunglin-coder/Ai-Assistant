import React from "react"
import { ToolCall } from "../../types"
import { ChartPreview } from "./chart"
import { ProductCards } from "./product-card"

type ToolRegistry = {
  [key: string]: React.FC<any>
}

export const toolRegistry: ToolRegistry = {
  "tool-chart": ChartPreview,
  "tool-products": ProductCards,
  // 'tool-images': ImageCarousel,
  // 'tool-document': DocumentViewer,
  // 'tool-code': CodeEditor,
}

export function getToolComponent(name: string): React.FC<ToolCall> {
  return toolRegistry[name] || (() => <div className="text-red-500">Tool not registered: {name}</div>)
}
