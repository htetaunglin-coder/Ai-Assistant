import React from "react"
import { ToolCall } from "../types"
import Chart from "./chart"

const ToolCallPreview = ({ toolCall }: { toolCall: ToolCall }) => {
  switch (toolCall.function.name) {
    case "chart":
      return toolCall.state === "loading" ? (
        <div key={toolCall.id} className="skeleton">
          <Chart {...toolCall.function.arguments} />
        </div>
      ) : (
        <div key={toolCall.id}>
          <Chart {...toolCall.function.arguments} />
        </div>
      )
    default:
      return null
  }
}

export { ToolCallPreview }
