import { getJsonCookie } from "@/utils/cookies/client"
import {
  AppLayoutCookieData,
  CHAT_LAYOUT_COOKIE_MAX_AGE,
  CHAT_LAYOUT_COOKIE_NAME,
  defaultCookieData,
} from "./constants"
import { validatePanels, validateSizes } from "./validate"

/**
 * Updates the chat layout cookie with new panel states or sizes.
 * This function is intended for client-side usage.
 * @param options.states The panel states to update.
 * @param options.sizes The new array of sizes for all panels.
 */
export function updateAppLayoutCookie({ panels: states, sizes }: Partial<AppLayoutCookieData>) {
  if (typeof document === "undefined") {
    return
  }

  let currentData: AppLayoutCookieData = { ...defaultCookieData }

  const existingData = getJsonCookie<AppLayoutCookieData>(CHAT_LAYOUT_COOKIE_NAME)

  if (existingData && typeof existingData === "object") {
    currentData = {
      panels: validatePanels(existingData.panels),
      sizes: validateSizes(existingData.sizes),
    }
  }

  if (states !== undefined) {
    currentData.panels = validatePanels(states)
  }

  if (sizes !== undefined) {
    currentData.sizes = validateSizes(sizes)
  }

  try {
    const updatedCookieValue = encodeURIComponent(JSON.stringify(currentData))

    document.cookie = `${CHAT_LAYOUT_COOKIE_NAME}=${updatedCookieValue}; path=/; max-age=${CHAT_LAYOUT_COOKIE_MAX_AGE}`
  } catch (error) {
    console.error("Failed to set resizable layout cookie:", error)
  }
}
