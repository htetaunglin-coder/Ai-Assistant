"use client"

import React, { KeyboardEventHandler, useEffect, useRef, useState } from "react"
/* -------------------------------------------------------------------------- */
// NOTE: This import intentionally breaks the feature isolation rule.
// Chat history and active chat are tightly connected — when a new chat completes,
// we optimistically update the history list. Keeping them slightly coupled here
// makes the overall architecture simpler and more maintainable.
import { upsertConversationItemInCache } from "@/features/conversations/api/cache"
import { ConversationItem } from "@/features/conversations/types"
import { formatBytes } from "@/utils/file"
import { Button, cn } from "@mijn-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  Box,
  CircleDollarSign,
  CreditCard,
  FileSpreadsheet,
  FileText,
  GlobeIcon,
  HandCoins,
  ImageIcon,
  Loader2,
  Loader2Icon,
  Paperclip,
  Scale,
  SendIcon,
  Square,
  TrendingUp,
  X,
} from "lucide-react"
import TextareaAutosize from "react-textarea-autosize"
import { toast } from "sonner"
import { useDebounceCallback, useLocalStorage } from "usehooks-ts"
import { ACCEPT_FILE_TYPES } from "@/lib/file"
/* -------------------------------------------------------------------------- */

import { FileWithStatus, useFileUpload } from "@/hooks/use-file-upload"
import { useIsDesktop } from "@/hooks/use-screen-sizes"
/* -------------------------------------------------------------------------- */

import { getIconForFilename } from "@/components/file-name-icon-map"
import { Tooltip } from "@/components/tooltip-wrapper"
import { FileUpload, FileUploadContent, FileUploadTrigger } from "@/components/ui/file-upload"
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
  const hasMessage = messages.length > 0

  return (
    <div className="pointer-events-none absolute inset-0 z-20 w-full">
      <div className="mx-auto flex size-full flex-col items-center justify-center">
        {!hasMessage && (
          <div className="flex size-full items-center justify-center md:h-auto xl:max-w-[90%]">
            <WelcomeMessage />
          </div>
        )}

        {/* just a place holder element to push the prompt input to the bottom */}
        {hasMessage && <div key="conversation-panel" className="pointer-events-none size-full origin-bottom" />}

        <motion.div
          layout
          className="pointer-events-auto flex w-full shrink-0 items-center justify-center bg-secondary p-4 lg:px-0 lg:py-4">
          {children}
        </motion.div>

        {!hasMessage && (
          <div className="flex w-full items-center justify-center xl:max-w-[90%]">
            <SuggestionItems />
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

type Draft = {
  id: string
  content: string
  timestamp: number
}

const PromptAreaInput = () => {
  const [input, setInput] = useState("")
  const [isSearchEnabled, setIsSearchEnabled] = useState(false)

  const [drafts, setDrafts] = useLocalStorage<Draft[]>("conversation_drafts", [])
  const shouldSaveRef = useRef(true)

  const status = useChatStore((state) => state.status)
  const sendMessage = useChatStore((state) => state.sendMessage)
  const stop = useChatStore((state) => state.stop)
  const conversationId = useChatStore((state) => state.conversationId)

  const queryClient = useQueryClient()

  const chatId = conversationId || "new_chat"
  const isSubmitDisabled = (!input && status === "idle") || status === "loading"
  const isBusy = status === "loading" || status === "streaming"

  const isDesktop = useIsDesktop()

  // Load draft on mount or when chatId changes
  useEffect(() => {
    const draft = drafts.find((d) => d.id === chatId)

    if (draft) {
      setInput(draft.content)
    }
    // We only want to set the input content as soon as the page loads or the chatId changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId])

  // Update URL when conversation ID changes
  useEffect(() => {
    if (conversationId) {
      window.history.replaceState({}, "", `/chat/${conversationId}`)
    }
  }, [conversationId])

  const saveDraft = useDebounceCallback((content: string) => {
    if (!shouldSaveRef.current) return

    if (!content.trim()) {
      // Remove draft if content is empty
      setDrafts((prev) => prev.filter((d) => d.id !== chatId))
      return
    }

    setDrafts((prev) => {
      const existingIndex = prev.findIndex((d) => d.id === chatId)
      const newDraft: Draft = {
        id: chatId,
        content,
        timestamp: Date.now(),
      }

      if (existingIndex >= 0) {
        // Update existing draft
        const updatedDrafts = [...prev]
        updatedDrafts[existingIndex] = newDraft
        return updatedDrafts
      } else {
        // Add new draft
        return [...prev, newDraft]
      }
    })
  }, 300)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const message = input.trim()

    sendMessage(message, {
      additionalData: {
        web_search: isSearchEnabled,
      },
      onFinish: (finishedMessage) => {
        const id = finishedMessage.conversation_id || conversationId
        if (!id) return

        const data: ConversationItem = {
          id,

          title: finishedMessage.conversation_title || message,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        upsertConversationItemInCache(queryClient, data)
      },
      onError: (error) => {
        console.log(error)
        toast.error(error.message || "Something Went Wrong, Please try again.")
      },
    })

    setInput("")

    shouldSaveRef.current = false
    // Clear draft after successful submission
    setDrafts((prev) => prev.filter((d) => d.id !== chatId))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    shouldSaveRef.current = true
    setInput(value)
    saveDraft(value)
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

  // Currently, the file upload feature is only implemented on the frontend, and the backend is not ready yet.
  // For now, we are using placeholder data. TODO: We need to discuss this further.
  const { filesWithStatus, handleFileUpload, handleFileRemove } = useFileUpload({
    onError: (error) => {
      toast.error(error)
    },
    conversationId: chatId,
    // We need to obtain an actual user ID, but for now, I'll leave it as is until we have the discussion.
    uid: "user_id",
  })

  return (
    <form
      className="w-full max-w-[var(--chat-view-max-width)] overflow-hidden rounded-xl border bg-background shadow-none"
      onSubmit={handleSubmit}>
      {filesWithStatus.length > 0 && <FileUploadPreview files={filesWithStatus} onRemove={handleFileRemove} />}

      <TextareaAutosize
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onHeightChange={handleHeightChange}
        minRows={2}
        maxRows={10}
        autoFocus={isDesktop ? true : false}
        placeholder="What would you like to know?"
        className="w-full resize-none rounded-none border-none bg-transparent p-4 text-sm shadow-none outline-none transition-[height] duration-300 dark:bg-transparent"
      />
      <div className="flex items-center justify-between p-1">
        <div className="flex items-center [&_button:first-child]:rounded-bl-xl">
          <FileUpload onFilesAdded={handleFileUpload} multiple accept={ACCEPT_FILE_TYPES.join(",")}>
            <FileUploadTrigger asChild>
              <Tooltip content="Attach files" options={{ side: "bottom" }}>
                <Button
                  size="sm"
                  className="shrink-0 gap-1.5 text-secondary-foreground"
                  variant="ghost"
                  type="button"
                  iconOnly
                  aria-label="Add files">
                  <Paperclip size={16} />
                </Button>
              </Tooltip>
            </FileUploadTrigger>
            <FileUploadContent>
              <div className="border-input flex flex-col items-center rounded-lg border border-dashed bg-background p-8">
                <ImageIcon className="size-8 text-muted-foreground" />
                <span className="mb-1 mt-4 text-lg font-medium">Drop files here</span>
                <span className="text-sm text-muted-foreground">Drop any files here to add it to the conversation</span>
              </div>
            </FileUploadContent>
          </FileUpload>

          {/* 
          !!Deep Research Option is not available for now, TODO: We need to discuss about this.

          <Button className="shrink-0 gap-1.5 text-secondary-foreground" variant="ghost" type="button" iconOnly>
            <Telescope size={16} />
          </Button> 
          */}
          <Button
            data-state={isSearchEnabled ? "active" : "inactive"}
            className="shrink-0 gap-1.5 text-secondary-foreground data-[state=active]:bg-primary-subtle data-[state=active]:text-primary-foreground-subtle"
            variant="ghost"
            type="button"
            onClick={() => setIsSearchEnabled((prev) => !prev)}>
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

/* -------------------------------------------------------------------------- */

type FileUploadPreviewProps = {
  files: FileWithStatus[]
  onRemove: (file: File) => void
  className?: string
}

const FileUploadPreview = ({ files, onRemove, className }: FileUploadPreviewProps) => {
  if (files.length === 0) return null

  return (
    <div className={cn("flex flex-wrap gap-2 p-2", className)}>
      {files.map((fileWithStatus) => (
        <FilePreviewCard
          key={fileWithStatus.file.name}
          fileWithStatus={fileWithStatus}
          onRemove={() => onRemove(fileWithStatus.file)}
        />
      ))}
    </div>
  )
}

const FilePreviewCard = ({ fileWithStatus, onRemove }: { fileWithStatus: FileWithStatus; onRemove: () => void }) => {
  const { file, status, preview } = fileWithStatus
  const isImage = file.type.startsWith("image/")
  const isLoading = status === "validating" || status === "uploading"

  return (
    <div className={cn("relative flex h-16 w-72 items-center gap-3 rounded-lg border p-2")}>
      <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground">
        {isImage && preview ? (
          // eslint-disable-next-line
          <img src={preview} alt={file.name} className="size-full rounded-md object-cover" />
        ) : getIconForFilename(file.name) ? (
          React.createElement(getIconForFilename(file.name)!, { size: 24 })
        ) : (
          <FileText className="size-6 text-muted-foreground" />
        )}

        {isLoading && (
          <div className="absolute -inset-1 flex items-center justify-center rounded-lg bg-black/40">
            <Loader2 className="size-5 animate-spin text-inverse" />
          </div>
        )}
      </div>

      <div className="w-full space-y-1 truncate">
        <p className="w-full truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
      </div>

      <button
        onClick={onRemove}
        className={cn(
          "absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-danger text-danger-foreground shadow-sm transition-opacity hover:opacity-80",
          isLoading && "pointer-events-none opacity-50",
        )}
        disabled={isLoading}
        aria-label={`Remove ${file.name}`}>
        <X className="size-3.5" />
      </button>
    </div>
  )
}
/* -------------------------------------------------------------------------- */

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
