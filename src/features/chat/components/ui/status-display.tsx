import React, { memo } from "react"
import { Badge, cn, tv } from "@mijn-ui/react"
import { AnimatePresence, motion } from "framer-motion"

const statusDisplay = tv({
  slots: {
    container: "flex w-full items-center gap-3 rounded-lg border border-border bg-background-alt px-4 py-3",
    title: "text-sm font-medium text-secondary-foreground",
    description: "text-sm text-muted-foreground",
    indicator: "size-2 rounded-full",
  },
  variants: {
    status: {
      created: {
        indicator: "bg-muted-foreground",
      },
      in_progress: {
        indicator: "animate-pulse bg-warning-emphasis",
      },
      waiting: {
        indicator: "animate-pulse bg-warning-emphasis",
      },
      preparing: {
        indicator: "animate-pulse bg-warning-emphasis",
      },
      error: {
        container: "border-border-danger-subtle bg-danger-subtle dark:bg-danger-subtle/20",
        title: "text-danger-emphasis",
        indicator: "bg-danger-emphasis",
      },
      completed: {
        indicator: "bg-success-emphasis",
      },
    },
  },
})

type StatusDisplayProps = {
  title: string
  description?: string
  status: "created" | "in_progress" | "waiting" | "preparing" | "completed" | "error"
}

const PureStatusDisplay = ({ title, description, status }: StatusDisplayProps) => {
  const styles = statusDisplay({ status })

  return (
    <div className={styles.container()} role="status" aria-live={status === "in_progress" ? "polite" : "off"}>
      <div className="min-w-0 flex-1">
        {status === "in_progress" || "waiting" || "preparing" ? (
          <AnimatedLoadingText>{title}</AnimatedLoadingText>
        ) : (
          <p className={styles.title()}>{title}</p>
        )}

        {description && <p className={styles.description()}>{description}</p>}
      </div>

      <div className="shrink-0">
        <Badge variant="default-subtle" className="gap-2 rounded-full px-2">
          <div className={styles.indicator()} />
          <p className="text-xs capitalize">{status}</p>
        </Badge>
      </div>
    </div>
  )
}

export const StatusDisplay = memo(PureStatusDisplay)

const AnimatedLoadingText = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-start">
      <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              backgroundPosition: ["200% center", "-200% center"],
            }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              opacity: { duration: 0.3 },
              y: { duration: 0.3 },
              backgroundPosition: {
                duration: 2.5,
                ease: "linear",
                repeat: Infinity,
              },
            }}
            className={cn(
              "flex min-w-max justify-center whitespace-nowrap bg-gradient-to-r from-neutral-950 via-neutral-400 to-neutral-950 bg-[length:200%_100%] bg-clip-text text-sm font-medium text-transparent dark:from-white dark:via-neutral-600 dark:to-white",
              className,
            )}>
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
