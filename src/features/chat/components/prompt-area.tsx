"use client"

import React from "react"
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
  Paperclip,
  Scale,
  Telescope,
  TrendingUp,
} from "lucide-react"
import {
  AIInput,
  AIInputButton,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "../components/ui/ai-input"
import { useChatStore } from "../stores/chat-store-provider"

const PromptArea = () => {
  const messages = useChatStore((state) => state.messages)

  const hasConversation = messages.length > 0

  return (
    <div className="pointer-events-none absolute inset-0 z-50 w-full">
      <div className="mx-auto flex size-full flex-col items-center justify-center">
        {!hasConversation && <WelcomeMessage />}

        {hasConversation && (
          <motion.div
            key="conversation-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "100%", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="size-full origin-bottom"
          />
        )}

        <motion.div
          layout
          className="pointer-events-auto flex w-full shrink-0 items-center justify-center bg-secondary p-4 pt-0 xl:max-w-[90%]">
          <PromptAreaInput />
        </motion.div>

        {!hasConversation && <SuggestionItems />}
      </div>
    </div>
  )
}

export { PromptArea }

/* -------------------------------------------------------------------------- */

const PromptAreaInput = () => {
  const status = useChatStore((state) => state.status)
  const input = useChatStore((state) => state.input)
  const setInput = useChatStore((state) => state.setInput)
  const handleSubmit = useChatStore((state) => state.handleSubmit)
  const stop = useChatStore((state) => state.stop)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const isSubmitDisabled = (!input && status === "idle") || status === "loading"

  return (
    <AIInput className="w-full max-w-[var(--chat-view-max-width)]" onSubmit={handleSubmit}>
      <AIInputTextarea maxHeight={300} onChange={handleInputChange} value={input} />
      <AIInputToolbar>
        <AIInputTools>
          <AIInputButton iconOnly>
            <Paperclip size={16} />
          </AIInputButton>
          <AIInputButton iconOnly>
            <Telescope size={16} />
          </AIInputButton>
          <AIInputButton>
            <GlobeIcon size={16} />
            <span>Search</span>
          </AIInputButton>
        </AIInputTools>
        <AIInputSubmit status={status} disabled={isSubmitDisabled} onClick={() => status === "streaming" && stop()} />
      </AIInputToolbar>
    </AIInput>
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
}

const SUGGESTION_ITEMS: SuggestionItemType[] = [
  {
    id: "balance-sheet",
    icon: <FileSpreadsheet className="text-blue-600 dark:text-blue-400" />,
    text: "Balance Sheet",
  },
  {
    id: "income-statement",
    icon: <TrendingUp className="text-green-600 dark:text-green-400" />,
    text: "Income Statement",
  },
  {
    id: "cash-flow",
    icon: <CircleDollarSign className="text-purple-600 dark:text-purple-400" />,
    text: "Cash Flow",
  },
  {
    id: "equity-changes",
    icon: <Scale className="text-yellow-600 dark:text-yellow-400" />,
    text: "Equity Changes",
  },
  {
    id: "sales-report",
    icon: <FileText className="text-blue-600 dark:text-blue-400" />,
    text: "Sales Report",
  },
  {
    id: "inventory",
    icon: <Box className="text-yellow-600 dark:text-yellow-400" />,
    text: "Inventory",
  },

  {
    id: "receivables",
    icon: <HandCoins className="text-green-600 dark:text-green-400" />,
    text: "Receivables",
  },
  {
    id: "payables",
    icon: <CreditCard className="text-red-600 dark:text-red-400" />,
    text: "Payables",
  },
]

const SuggestionItems = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ delay: 0.8 }}
      className="pointer-events-auto mt-6 hidden max-w-[var(--chat-view-max-width)] flex-wrap items-center gap-2 px-4 md:flex lg:px-0">
      {SUGGESTION_ITEMS.map((item) => (
        <Button key={item.id} size="sm" className="gap-2">
          {item.icon}
          {item.text}
        </Button>
      ))}
    </motion.div>
  )
}
