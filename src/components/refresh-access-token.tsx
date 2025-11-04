"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

// Even though the cookie update issue is already fixed in next.js,
// I just add this to prevent a serious problem like infinite redirect with middleware.
// Issue: https://github.com/vercel/next.js/discussions/50374
// Fixed PR: https://github.com/vercel/next.js/pull/67924
export const RefreshAccessToken = () => {
  const router = useRouter()
  const hasTried = useRef(false)
  const [attempts, setAttempts] = useState(0)
  const MAX_ATTEMPTS = 2

  useEffect(() => {
    if (hasTried.current) return
    hasTried.current = true

    if (attempts >= MAX_ATTEMPTS) {
      router.push("/login")
      return
    }

    setAttempts((prev) => prev + 1)
    router.refresh()
  }, [router, attempts])

  return null
}
