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
    description: "Your request has been received and will be processed shortly",
  },
  in_progress: {
    title: "Processing...",
    description: "Please wait while we handle your request",
  },
  completed: {
    title: "Operation completed",
    description: "Your request has been processed successfully",
  },
  error: {
    title: "Operation failed",
    description: "Something went wrong while processing your request",
  },
} as const

/* -------------------------------------------------------------------------- */

const PureStatusView = ({ status, description, title }: StatusViewProps) => {
  if (!status) {
    return null
  }

  const defaultMessages = DEFAULT_MESSAGES[status]

  const displayData = {
    status: status,
    title: title || defaultMessages.title,
    description: description || defaultMessages.description,
  }

  return <StatusDisplay {...displayData} />
}

const StatusView = memo(PureStatusView)

export default StatusView
