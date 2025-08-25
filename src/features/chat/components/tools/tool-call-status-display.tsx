import { tv } from "@mijn-ui/react"
import { AlertCircle, Check, LucideIcon } from "lucide-react"

type StatusType = "loading" | "error" | "success"

type ToolCallStatusDisplayProps = {
  icon: LucideIcon
  title: string
  description?: string
  status: StatusType
}

const statusDisplay = tv({
  slots: {
    container: "flex items-center gap-3 rounded-lg border p-4",
    icon: "size-5",
    title: "text-sm font-medium",
    description: "text-sm text-secondary-foreground",
    indicator: "size-4",
  },
  variants: {
    status: {
      loading: {
        container: "border-border bg-background-alt",
        icon: "text-foreground",
        indicator: "animate-spin rounded-full border-2 border-border-primary border-t-transparent",
      },
      error: {
        container: "border-border-danger-subtle bg-danger-subtle dark:bg-danger-subtle/20",
        icon: "text-danger-emphasis",
        title: "text-danger-emphasis",
        indicator: "text-danger-emphasis",
      },
      success: {
        container: "border-border-success-subtle bg-success-subtle dark:bg-success-subtle/20",
        icon: "text-success-emphasis",
        title: "text-success-emphasis",
        indicator: "text-success-emphasis",
      },
    },
  },
})

const ToolCallStatusDisplay = ({ icon: Icon, title, description, status }: ToolCallStatusDisplayProps) => {
  const styles = statusDisplay({ status })

  return (
    <div className={styles.container()} role="status" aria-live={status === "loading" ? "polite" : "off"}>
      <div className="shrink-0">
        <Icon className={styles.icon()} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className={styles.title()}>{title}</p>
        {description && <p className={styles.description()}>{description}</p>}
      </div>

      <div className="shrink-0">
        <StatusIndicator status={status} className={styles.indicator()} />
      </div>
    </div>
  )
}

const StatusIndicator = ({ status, className }: { status: StatusType; className?: string }) => {
  switch (status) {
    case "loading":
      return <div className={className} aria-label="Loading" />
    case "error":
      return <AlertCircle className={className} aria-label="Error" />
    case "success":
      return <Check className={className} aria-label="Success" />
    default:
      return null
  }
}

export { ToolCallStatusDisplay }
