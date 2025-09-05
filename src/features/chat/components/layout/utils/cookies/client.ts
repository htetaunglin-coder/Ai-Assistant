import { getJsonCookie } from "@/utils/cookies/client"
import {
  CHAT_LAYOUT_COOKIE_MAX_AGE,
  CHAT_LAYOUT_COOKIE_NAME,
  ChatLayoutCookieData,
  defaultCookieData,
} from "./constants"
import { validateActiveView, validatePanels, validateSizes } from "./validate"

/**
 * Updates the chat layout cookie with new panel states or sizes.
 * This function is intended for client-side usage.
 * @param options.states The panel states to update.
 * @param options.sizes The new array of sizes for all panels.
 * @param options.activeView The active view identifier.
 */
export function updateChatLayoutCookie({ panels: states, sizes, activeView }: Partial<ChatLayoutCookieData>) {
  if (typeof document === "undefined") {
    return
  }

  let currentData: ChatLayoutCookieData = { ...defaultCookieData }

  const existingData = getJsonCookie<ChatLayoutCookieData>(CHAT_LAYOUT_COOKIE_NAME)

  if (existingData && typeof existingData === "object") {
    currentData = {
      panels: validatePanels(existingData.panels),
      sizes: validateSizes(existingData.sizes),
      activeView: validateActiveView(existingData.activeView),
    }
  }

  if (states !== undefined) {
    currentData.panels = validatePanels(states)
  }

  if (sizes !== undefined) {
    currentData.sizes = validateSizes(sizes)
  }

  if (activeView !== undefined) {
    currentData.activeView = validateActiveView(activeView)
  }

  try {
    const updatedCookieValue = encodeURIComponent(JSON.stringify(currentData))

    document.cookie = `${CHAT_LAYOUT_COOKIE_NAME}=${updatedCookieValue}; path=/; max-age=${CHAT_LAYOUT_COOKIE_MAX_AGE}`
  } catch (error) {
    console.error("Failed to set resizable layout cookie:", error)
  }
}
