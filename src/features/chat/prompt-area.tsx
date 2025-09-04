"use client"

import React, { KeyboardEventHandler, useEffect, useState } from "react"
import { Button, cn } from "@mijn-ui/react"
import { motion } from "framer-motion"
import {
  Box,
  CircleDollarSign,
  CreditCard,
  FileSpreadsheet,
  FileText,
  GlobeIcon,
  HandCoins,
  Loader2Icon,
  Paperclip,
  Scale,
  SendIcon,
  Square,
  Telescope,
  TrendingUp,
} from "lucide-react"
import TextareaAutosize from "react-textarea-autosize"
import { useChatStore } from "./stores/chat-store-provider"

const PromptArea = () => {
  return (
    <PromptAreaContainer>
      <PromptAreaInput />
    </PromptAreaContainer>
  )
}

export { PromptArea }

/* -------------------------------------------------------------------------- */

const PromptAreaContainer = ({ children }: { children: React.ReactNode }) => {
  const messages = useChatStore((state) => state.messages)
  const hasConversation = messages.length > 0

  return (
    <div className="pointer-events-none absolute inset-0 z-30 w-full">
      <div className="mx-auto flex size-full flex-col items-center justify-center">
        {!hasConversation && (
          <div className="flex size-full items-center justify-center md:h-auto xl:max-w-[90%]">
            <WelcomeMessage />
          </div>
        )}

        {/* just a place holder element to push the prompt input to the bottom */}
        {hasConversation && <div key="conversation-panel" className="pointer-events-none size-full origin-bottom" />}

        <motion.div
          layout
          className="pointer-events-auto flex w-full shrink-0 items-center justify-center bg-secondary p-4 lg:p-0 xl:max-w-[90%]">
          {children}
        </motion.div>

        {!hasConversation && (
          <div className="flex w-full items-center justify-center xl:max-w-[90%]">
            <SuggestionItems />
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

const PromptAreaInput = () => {
  const [input, setInput] = useState("")
  const status = useChatStore((state) => state.status)

  const sendMessage = useChatStore((state) => state.sendMessage)
  const stop = useChatStore((state) => state.stop)
  const conversationId = useChatStore((state) => state.conversationId)

  const isSubmitDisabled = (!input && status === "idle") || status === "loading"
  const isBusy = status === "loading" || status === "streaming"

  useEffect(() => {
    if (conversationId) {
      window.history.replaceState({}, "", `/chat/${conversationId}`)
    }
  }, [conversationId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Not sure if I need to trim the message before making a request or not
    const message = input.trim()

    sendMessage(message)

    setInput("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && e.shiftKey === false) {
      if (isBusy) return

      e.preventDefault()

      const form = e.currentTarget.form
      if (form) {
        form.requestSubmit()
      }
    }
  }

  const handleHeightChange = (height: number) => {
    document.documentElement.style.setProperty("--prompt-area-height", `${height}px`)
  }

  return (
    <form
      className="w-full max-w-[var(--chat-view-max-width)] overflow-hidden rounded-xl border bg-background shadow-none"
      onSubmit={handleSubmit}>
      <TextareaAutosize
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onHeightChange={handleHeightChange}
        minRows={2}
        maxRows={10}
        autoFocus
        placeholder="What would you like to know?"
        className="w-full resize-none rounded-none border-none bg-transparent p-4 text-sm shadow-none outline-none transition-[height] duration-300 dark:bg-transparent"
      />
      <div className="flex items-center justify-between p-1">
        <div className="flex items-center [&_button:first-child]:rounded-bl-xl">
          <Button className="shrink-0 gap-1.5 text-secondary-foreground" variant="ghost" type="button" iconOnly>
            <Paperclip size={16} />
          </Button>
          <Button className="shrink-0 gap-1.5 text-secondary-foreground" variant="ghost" type="button" iconOnly>
            <Telescope size={16} />
          </Button>
          <Button className="shrink-0 gap-1.5 text-secondary-foreground" variant="ghost" type="button">
            <GlobeIcon size={16} />
            <span>Search</span>
          </Button>
        </div>

        <Button
          disabled={isSubmitDisabled}
          onClick={() => status === "streaming" && stop()}
          className="gap-1.5 rounded-lg rounded-br-xl"
          type="submit"
          iconOnly>
          {status === "loading" ? (
            <Loader2Icon className="animate-spin" />
          ) : status === "streaming" ? (
            <Square className="bg-foreground" />
          ) : (
            <SendIcon />
          )}
        </Button>
      </div>
    </form>
  )
}

const WelcomeMessage = () => {
  return (
    <div
      className={cn(
        "pointer-events-auto mb-4 flex w-full max-w-[var(--chat-view-max-width)] grow flex-col items-start justify-center px-4 md:grow-0 lg:px-0 xl:max-w-3xl",
      )}>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-semibold md:text-xl md:font-medium">
        Hello there!
      </motion.h1>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-2xl font-medium text-muted-foreground md:text-xl md:font-normal">
        How can I help you today?
      </motion.h1>
    </div>
  )
}

type SuggestionItemType = {
  id: string
  icon: React.ReactNode
  text: string
  prompt: string
}

const SUGGESTION_ITEMS: SuggestionItemType[] = [
  {
    id: "balance-sheet",
    icon: <FileSpreadsheet className="text-blue-600 dark:text-blue-400" />,
    text: "Balance Sheet",
    prompt:
      "Generate a balance sheet summarizing assets, liabilities, and equity for the current accounting period. Highlight key trends or anomalies.",
  },
  {
    id: "income-statement",
    icon: <TrendingUp className="text-green-600 dark:text-green-400" />,
    text: "Income Statement",
    prompt:
      "Prepare an income statement showing revenue, expenses, and net profit for the selected period. Point out significant changes compared to last month or quarter.",
  },
  {
    id: "cash-flow",
    icon: <CircleDollarSign className="text-purple-600 dark:text-purple-400" />,
    text: "Cash Flow",
    prompt:
      "Generate a cash flow statement broken down into operating, investing, and financing activities. Identify potential liquidity issues.",
  },
  {
    id: "equity-changes",
    icon: <Scale className="text-yellow-600 dark:text-yellow-400" />,
    text: "Equity Changes",
    prompt:
      "Show the statement of changes in equity, including retained earnings, new investments, and withdrawals. Highlight how shareholder equity is evolving.",
  },
  {
    id: "sales-report",
    icon: <FileText className="text-blue-600 dark:text-blue-400" />,
    text: "Sales Report",
    prompt:
      "Provide a sales report including total sales, top-selling products, and sales trends over time. Emphasize medicine categories if relevant.",
  },
  {
    id: "inventory",
    icon: <Box className="text-yellow-600 dark:text-yellow-400" />,
    text: "Inventory",
    prompt:
      "Generate an inventory report with stock levels, low-stock alerts, and fast-moving vs slow-moving medicines. Recommend reorder points if needed.",
  },

  {
    id: "receivables",
    icon: <HandCoins className="text-green-600 dark:text-green-400" />,
    text: "Receivables",
    prompt:
      "List customer receivables, overdue invoices, and expected payment dates. Highlight customers with the highest outstanding balances.",
  },
  {
    id: "payables",
    icon: <CreditCard className="text-red-600 dark:text-red-400" />,
    text: "Payables",
    prompt:
      "Show supplier payables, upcoming due dates, and overdue payments. Flag high-risk suppliers that may impact medicine availability.",
  },
]

const SuggestionItems = () => {
  const sendMessage = useChatStore((state) => state.sendMessage)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ delay: 0.8 }}
      className="pointer-events-auto mt-6 hidden max-w-[var(--chat-view-max-width)] flex-wrap items-center gap-2 px-4 md:flex lg:px-0">
      {SUGGESTION_ITEMS.map((item) => (
        <Button key={item.id} size="sm" className="gap-2" onClick={() => sendMessage(item.prompt)}>
          {item.icon}
          {item.text}
        </Button>
      ))}
    </motion.div>
  )
}
