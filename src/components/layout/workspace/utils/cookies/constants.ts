export const WORKSPACE_LAYOUT_COOKIE_NAME = "workspace_layout"
export const WORKSPACE_LAYOUT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export type WorkspaceLayoutCookieData = {
  panels: Record<string, boolean>
  sizes: number[]
}

export const defaultCookieData: WorkspaceLayoutCookieData = {
  panels: {},
  sizes: [],
}
