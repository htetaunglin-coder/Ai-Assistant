export type ConversationItem = { id: string; title: string; created_time: string; updated_time: string }

export type Conversations = {
  items: ConversationItem[]
}

export type ConversationAPIResponse = Conversations & {
  next_page: number | null
  has_more: boolean
}
