"use client"

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger } from "@mijn-ui/react"
import { ModelProviderLogo } from "@/components/model-provider-logo"

type ModelSelectorProps = {
  models: { id: string; name: string; group: string; provider: string; description: string }[]
  selectedModel: string
  onModelChange: (model: string) => void
}

const ModelSelector = ({ models, selectedModel, onModelChange }: ModelSelectorProps) => {
  // Get unique groups in order of appearance
  const groups = Array.from(new Set(models.map((model) => model.group)))

  const selectedModelData = models.find((model) => model.id === selectedModel)

  return (
    <Select value={selectedModel} onValueChange={onModelChange}>
      <SelectTrigger className="h-9 min-w-0 border-0 bg-transparent px-2.5 text-sm font-medium text-secondary-foreground">
        <div className="flex items-center gap-1.5">
          {selectedModelData?.provider && <ModelProviderLogo provider={selectedModelData.provider} />}
          {selectedModelData?.name && <p className="text-sm">{selectedModelData.name}</p>}
        </div>
      </SelectTrigger>
      <SelectContent position="popper">
        {groups.map((group) => (
          <SelectGroup key={group}>
            <SelectLabel className="px-3 py-2 text-xs text-secondary-foreground">{group}</SelectLabel>
            {models
              .filter((model) => model.group === group)
              .map((model) => (
                <SelectItem key={model.id} value={model.id} className="h-14">
                  <div className="flex h-full items-start gap-1.5">
                    <ModelProviderLogo provider={model.provider} className="mt-1" />
                    <div className="text-sm">
                      {model.name}
                      <p className="text-xs text-secondary-foreground/80">{model.description}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

export { ModelSelector }
