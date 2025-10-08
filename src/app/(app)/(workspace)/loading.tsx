import React from "react"
import { Spinner } from "@/components/ui/spinner"

const Loading = () => {
  return (
    <div className="flex size-full items-center justify-center text-foreground">
      <Spinner size={40} color="hsl(var(--mijnui-foreground))" />
    </div>
  )
}

export default Loading
