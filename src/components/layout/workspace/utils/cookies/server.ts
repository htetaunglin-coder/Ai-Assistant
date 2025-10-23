"use server"

import { cookies } from "next/headers"
import { WORKSPACE_LAYOUT_COOKIE_NAME, WorkspaceLayoutCookieData, defaultCookieData } from "./constants"
import { validatePanels, validateSizes } from "./validate"

/**
 * Reads and validates the workspace layout cookie from server-side headers.
 * If invalid or missing, returns the provided defaultData (if any),
 * or falls back to internal defaults.
 *
 * @param defaultData - Partial layout data to use as fallback.
 * @returns A complete, validated layout config.
 */
export async function getServerSideWorkspaceLayoutCookieData(
  defaultData?: WorkspaceLayoutCookieData,
): Promise<WorkspaceLayoutCookieData | undefined> {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(WORKSPACE_LAYOUT_COOKIE_NAME)?.value

  if (!cookieValue) {
    return defaultData ?? undefined
  }

  try {
    const parsedData: WorkspaceLayoutCookieData = JSON.parse(decodeURIComponent(cookieValue))

    return {
      panels: validatePanels(parsedData.panels) ?? defaultData?.panels ?? defaultCookieData.panels,
      sizes: validateSizes(parsedData.sizes) ?? defaultData?.sizes ?? defaultCookieData.sizes,
    }
  } catch (error) {
    console.error("Failed to parse server-side resizable layout cookie:", error)
    return defaultData ?? undefined
  }
}
