import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  cn,
} from "@mijn-ui/react"
import { AlertCircle, Sparkles } from "lucide-react"
import { getAgentIconOptions } from "./agent-icon"

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

/* -------------------------------------------------------------------------- */

const AVAILABLE_MODELS = [
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "claude-3-opus", label: "Claude 3 Opus" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
  { value: "deepseek-r1", label: "DeepSeek R1" },
  { value: "gemini-pro", label: "Gemini Pro" },
  { value: "llama-3-70b", label: "Llama 3 70B" },
]

const AgentDetailsForm = ({
  id,
  name,
  description,
  icon,
  model,
  system_instruction,
}: {
  id: string
  name: string
  description: string
  icon: string
  model: string
  system_instruction: string
}) => {
  return (
    <form className="w-full space-y-6">
      <Alert variant="danger">
        <AlertIcon>
          <AlertCircle className="size-4" />
        </AlertIcon>
        <AlertTitle>Agent Modification Unavailable</AlertTitle>
        <AlertDescription>
          Agent modification is currently in development. This form is read-only for now.
        </AlertDescription>
      </Alert>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Basic Information</h3>
        <div className="space-y-4 px-2">
          <div className="space-y-1">
            <Label htmlFor="agent-id" className="text-sm font-medium text-secondary-foreground">
              Agent ID
            </Label>
            <Input id="agent-id" className="bg-background" disabled value={id} readOnly />
          </div>

          <div className="space-y-1">
            <Label htmlFor="agent-name" className="text-sm font-medium text-secondary-foreground">
              Name
            </Label>
            <Input id="agent-name" className="bg-background" disabled value={name} readOnly />
          </div>

          <div className="space-y-1">
            <Label htmlFor="agent-icon" className="text-sm font-medium text-secondary-foreground">
              Icon
            </Label>
            <Select value={icon} disabled>
              <SelectTrigger id="agent-icon" className="bg-background" disabled>
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                {getAgentIconOptions().map((iconOption) => (
                  <SelectItem key={iconOption.value} value={iconOption.value}>
                    <div className="flex items-center gap-2">
                      {iconOption.icon}
                      <span>{iconOption.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="agent-description" className="text-sm font-medium text-secondary-foreground">
              Description
            </Label>
            <Textarea
              id="agent-description"
              className="min-h-24 bg-background disabled:pointer-events-none"
              disabled
              value={description}
              readOnly
            />
          </div>
        </div>
      </div>

      <hr />

      {/* Configuration Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Configuration</h3>
        <div className="space-y-4 px-2">
          <div className="space-y-1">
            <Label htmlFor="agent-model" className="text-sm font-medium text-secondary-foreground">
              Model
            </Label>
            <Select value={model} disabled>
              <SelectTrigger id="agent-model" className="bg-background">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map((modelOption) => (
                  <SelectItem key={modelOption.value} value={modelOption.value}>
                    {modelOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="agent-system-instruction" className="text-sm font-medium text-secondary-foreground">
              System Instruction
            </Label>
            <Textarea
              id="agent-system-instruction"
              className="min-h-36 bg-background disabled:pointer-events-none"
              value={system_instruction}
              disabled
              readOnly
            />
          </div>
        </div>
      </div>
    </form>
  )
}

export { AgentDetailPlaceholder, AgentDetailsForm }
