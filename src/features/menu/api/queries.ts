import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  clearAllHistory,
  deleteChat,
  fetchAgents,
  fetchHistoryPage,
  fetchProjects,
  fetchUploads,
  searchHistory,
  updateChatTitle,
} from "./client"

/* -------------------------------------------------------------------------- */
/*                                 ChatHistory                                */
/* -------------------------------------------------------------------------- */

export const chatHistoryKeys = {
  all: ["chatHistory"] as const,
  infiniteHistory: () => [...chatHistoryKeys.all, "infinite"],
  searchHistory: (query: string) => [...chatHistoryKeys.all, "search", { query }],
}

export const useChatHistoryInfinite = () => {
  return useInfiniteQuery({
    queryKey: chatHistoryKeys.infiniteHistory(),
    queryFn: fetchHistoryPage,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.next_page,
  })
}

export const useSearchHistory = (query: string) => {
  return useQuery({
    queryKey: chatHistoryKeys.searchHistory(query),
    queryFn: () => searchHistory(query),
    enabled: query.trim().length > 0,
  })
}

export const useUpdateChatTitle = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newTitle }: { id: string; newTitle: string }) => updateChatTitle(id, newTitle),
    onSuccess: (_) => {
      queryClient.invalidateQueries({ queryKey: chatHistoryKeys.all })
      onSuccess?.()
    },
  })
}

export const useDeleteChat = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteChat(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatHistoryKeys.all })
      onSuccess?.()
    },
  })
}

export const useClearHistory = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: clearAllHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatHistoryKeys.all })
      onSuccess?.()
    },
  })
}

/* -------------------------------------------------------------------------- */

export const useAgents = () => {
  return useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
  })
}

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  })
}

export const useUploads = () => {
  return useQuery({
    queryKey: ["uploads"],
    queryFn: fetchUploads,
  })
}
