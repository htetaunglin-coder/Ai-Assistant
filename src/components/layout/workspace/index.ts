export {
  WORKSPACE_LAYOUT_COOKIE_MAX_AGE,
  WORKSPACE_LAYOUT_COOKIE_NAME,
  defaultCookieData,
  type WorkspaceLayoutCookieData,
} from "./utils/cookies/constants"
export { getServerSideWorkspaceLayoutCookieData } from "./utils/cookies/server"
export { updateWorkspaceLayoutCookie } from "./utils/cookies/client"

export { WorkspaceLayout, ArtifactPanel, PANEL_IDS } from "./workspace"
