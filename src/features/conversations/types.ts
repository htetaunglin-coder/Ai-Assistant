export type ConversationAPIResponse = {
  data: ConversationItem[]
  current_page: number
  last_page: number
  per_page: number
  from: number
  to: number
  total: number
  has_more: boolean
}

export type ConversationItem = {
  id: string
  user_id?: string
  title: string
  latest_response_id?: string
  created_by?: string
  created_at: string
  updated_at: string
}
