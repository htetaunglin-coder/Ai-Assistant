import { MenuPanelType } from "../../constants"

export const CHAT_LAYOUT_COOKIE_NAME = "chat_layout"
export const CHAT_LAYOUT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export type AppLayoutCookieData = {
  panels: Record<string, boolean>
  sizes: number[]
  activeView: MenuPanelType | null
}

export const defaultCookieData: AppLayoutCookieData = {
  panels: {},
  sizes: [],
  activeView: null,
}
