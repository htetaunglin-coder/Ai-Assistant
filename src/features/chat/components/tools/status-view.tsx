import { memo } from "react"
import { z } from "zod"
import { StatusDisplay } from "./shared/status-display"

export const statusViewSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["created", "in_progress", "completed", "error"]),
})

export type StatusViewProps = z.infer<typeof statusViewSchema>

const DEFAULT_MESSAGES = {
  created: {
    title: "Operation queued...",
  },
  in_progress: {
    title: "Processing...",
  },
  completed: {
    title: "Operation completed",
  },
  error: {
    title: "Operation failed",
  },
} as const

/* -------------------------------------------------------------------------- */

const PureStatusView = ({ status, title }: StatusViewProps) => {
  if (!status) {
    return null
  }

  const defaultMessages = DEFAULT_MESSAGES[status]

  const displayData = {
    status: status,
    title: title || defaultMessages.title,
  }

  return <StatusDisplay {...displayData} />
}

const StatusView = memo(PureStatusView)

export default StatusView
