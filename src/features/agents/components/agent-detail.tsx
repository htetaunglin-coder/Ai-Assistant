import { cn } from "@mijn-ui/react"
import { Sparkles } from "lucide-react"

const AgentDetailPlaceholder = ({ className }: { className?: string }) => {
  return (
    <div className={cn("w-full text-center", className)}>
      <div className="mb-4 flex justify-center">
        <div className="rounded-full bg-muted p-3">
          <Sparkles className="size-6 text-primary-emphasis" />
        </div>
      </div>
      <h2 className="text-lg font-semibold text-foreground">No Agent Selected</h2>
      <p className="mt-2 text-sm text-secondary-foreground">
        Select an agent from the list to view and modify its configuration.
      </p>
      <p className="mt-3 text-xs text-secondary-foreground/70">
        You can customize system prompts, context files, and model selection for each agent.
      </p>
    </div>
  )
}

export { AgentDetailPlaceholder }
