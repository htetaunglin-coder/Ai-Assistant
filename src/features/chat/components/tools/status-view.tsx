import { memo } from "react"
import { z } from "zod"
import { StatusDisplay } from "./shared/status-display"

export const statusViewSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["created", "in_progress", "waiting", "preparing", "completed", "error"]),
})

export type StatusViewProps = z.infer<typeof statusViewSchema>

const DEFAULT_MESSAGES = {
  created: {
    title: "Task created",
    description: "Queued for processing",
  },
  waiting: {
    title: "Waiting for server response",
    description: "Establishing connection",
  },
  preparing: {
    title: "Preparing resources",
    description: "Setting up components",
  },
  in_progress: {
    title: "Processing request",
    description: "This may take a moment",
  },
  completed: {
    title: "Successfully completed",
    description: "Operation finished",
  },
  error: {
    title: "Something went wrong",
    description: "Please try again or contact support",
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
