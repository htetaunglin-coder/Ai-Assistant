// We don't have an api end point for the history yet,
// I will just use mock data to fetch by simulating the network delay.
import { MOCK_AGENTS, MOCK_HISTORY, MOCK_PROJECTS, MOCK_UPLOADS } from "./mock-data"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/* -------------------------------------------------------------------------- */
/*                                 ChatHistory                                */
/* -------------------------------------------------------------------------- */

const PAGE_SIZE = 24

type ChatItem = {
  id: string
  title: string
  create_time: string
  update_time: string
}

type HistoryResponse = {
  items: ChatItem[]
  next_page: number | null
  has_more: boolean
}

export const fetchHistoryPage = async ({ pageParam = 0 }): Promise<HistoryResponse> => {
  await sleep(1500)

  console.log("Fetching history page:", pageParam)

  const start = pageParam * PAGE_SIZE
  const end = start + PAGE_SIZE
  const items = MOCK_HISTORY.items.slice(start, end)
  const hasMore = end < MOCK_HISTORY.items.length

  return {
    items,
    next_page: hasMore ? pageParam + 1 : null,
    has_more: hasMore,
  }
}

export const searchHistory = async (query: string): Promise<ChatItem[]> => {
  await sleep(300)
  console.log("Searching history for:", query)

  if (!query.trim()) {
    return []
  }

  const filtered = MOCK_HISTORY.items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))

  return filtered
}

export const updateChatTitle = async (id: string, newTitle: string): Promise<ChatItem> => {
  await sleep(800)
  console.log("Updating chat title:", id, newTitle)

  // Simulate occasional failure (10% chance)
  if (Math.random() < 0.1) {
    throw new Error("Failed to update chat title. Please try again.")
  }

  // Find and update the item in mock data
  const item = MOCK_HISTORY.items.find((item) => item.id === id)
  if (!item) {
    throw new Error("Chat not found")
  }

  return {
    ...item,
    title: newTitle,
    update_time: new Date().toISOString(),
  }
}

export const deleteChat = async (id: string): Promise<{ id: string }> => {
  await sleep(600)
  console.log("Deleting chat:", id)

  // Simulate occasional failure (10% chance)
  if (Math.random() < 0.1) {
    throw new Error("Failed to delete chat. Please try again.")
  }

  // Check if item exists
  const item = MOCK_HISTORY.items.find((item) => item.id === id)
  if (!item) {
    throw new Error("Chat not found")
  }

  // Remove from mock data
  const index = MOCK_HISTORY.items.findIndex((item) => item.id === id)
  if (index > -1) {
    MOCK_HISTORY.items.splice(index, 1)
  }

  return { id }
}

export const clearAllHistory = async (): Promise<{ success: boolean }> => {
  await sleep(1000)
  console.log("Clearing all history...")

  // Simulate occasional failure (10% chance)
  if (Math.random() < 0.1) {
    throw new Error("Failed to clear history. Please try again.")
  }

  MOCK_HISTORY.items = []

  return { success: true }
}

/* -------------------------------------------------------------------------- */

export const fetchAgents = async () => {
  await sleep(500)
  console.log("Fetching agents...")
  return MOCK_AGENTS
}

export const fetchProjects = async () => {
  await sleep(500)
  console.log("Fetching projects...")
  return MOCK_PROJECTS
}

export const fetchUploads = async () => {
  await sleep(500)
  console.log("Fetching uploads...")
  return MOCK_UPLOADS
}
