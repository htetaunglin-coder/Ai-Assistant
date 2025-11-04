import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { conversationClientAPI } from "./client"

export const conversationKeys = {
  all: ["conversations"] as const,
  infiniteList: () => [...conversationKeys.all, "infinite"],
  search: (query: string) => [...conversationKeys.all, "search", { query }],
}

export const useConversationsInfinite = () => {
  return useInfiniteQuery({
    queryKey: conversationKeys.infiniteList(),
    queryFn: conversationClientAPI.getConversationList,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.current_page || !lastPage?.last_page) return null

      return lastPage.current_page >= lastPage.last_page ? null : lastPage.current_page + 1
    },
  })
}

export const useSearchConversations = (query: string) => {
  return useQuery({
    queryKey: conversationKeys.search(query),
    queryFn: () => conversationClientAPI.searchConversations(query),
    enabled: query.trim().length > 0,
  })
}

export const useUpdateConversationTitle = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newTitle }: { id: string; newTitle: string }) =>
      conversationClientAPI.updateConversationTitle(id, newTitle),
    onSuccess: (_) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all })
      onSuccess?.()
    },
  })
}

export const useDeleteConversation = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => conversationClientAPI.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all })
      onSuccess?.()
    },
  })
}

export const useClearConversations = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: conversationClientAPI.clearAllConversations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all })
      onSuccess?.()
    },
  })
}
