import { getJsonCookie } from "@/utils/cookies/client"
import {
  WORKSPACE_LAYOUT_COOKIE_MAX_AGE,
  WORKSPACE_LAYOUT_COOKIE_NAME,
  WorkspaceLayoutCookieData,
  defaultCookieData,
} from "./constants"
import { validatePanels, validateSizes } from "./validate"

/**
 * Updates the workspace layout cookie with new panel states or sizes.
 * This function is intended for client-side usage.
 * @param options.states The panel states to update.
 * @param options.sizes The new array of sizes for all panels.
 */
export function updateWorkspaceLayoutCookie({ panels: states, sizes }: Partial<WorkspaceLayoutCookieData>) {
  if (typeof document === "undefined") {
    return
  }

  let currentData: WorkspaceLayoutCookieData = { ...defaultCookieData }

  const existingData = getJsonCookie<WorkspaceLayoutCookieData>(WORKSPACE_LAYOUT_COOKIE_NAME)

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

    document.cookie = `${WORKSPACE_LAYOUT_COOKIE_NAME}=${updatedCookieValue}; path=/; max-age=${WORKSPACE_LAYOUT_COOKIE_MAX_AGE}`
  } catch (error) {
    console.error("Failed to set resizable layout cookie:", error)
  }
}
