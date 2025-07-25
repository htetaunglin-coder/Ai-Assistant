import { Bot } from "lucide-react"
import Link from "next/link"
import React from "react"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Link href="/" className="absolute left-10 top-5 flex items-center space-x-2">
        <Bot className="text-2xl text-primary" />
        <span className="text-xl font-bold">Pica Bot</span>
      </Link>

      {children}
    </div>
  )
}

export default AuthLayout
