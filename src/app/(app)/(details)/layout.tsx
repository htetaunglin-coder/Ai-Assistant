import React from "react"
import DetailsLayout from "@/components/layout/details"

export default function Details({ children }: { children: React.ReactNode }) {
  return <DetailsLayout>{children}</DetailsLayout>
}
