import { PanelViewType } from "../../constants"

export const CHAT_LAYOUT_COOKIE_NAME = "chat_layout"
export const CHAT_LAYOUT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export type ChatLayoutCookieData = {
  panels: Record<string, boolean>
  sizes: number[]
  activeView: PanelViewType | null
}

export const defaultCookieData: ChatLayoutCookieData = {
  panels: {},
  sizes: [],
  activeView: null,
}
