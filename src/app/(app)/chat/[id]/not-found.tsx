import React from "react"
import Link from "next/link"
import { Button } from "@mijn-ui/react"

const NotFound = () => {
  return (
    <div className="flex size-full items-center justify-center">
      <div className="flex max-w-xl flex-col items-center justify-center px-4 text-center">
        <div className="text-3xl font-medium text-foreground">Chat not found</div>
        <div className="mt-6 text-secondary-foreground">
          If this was a link someone shared with you, please ask the sender to explicitly send a share link.
        </div>
        <div className="mt-8">
          <Button asChild>
            <Link href="/chat">Start a new chat</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
