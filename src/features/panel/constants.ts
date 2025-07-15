// Constants for chat panel views state.
export const PANEL_VIEWS = {
  HISTORY: "history",
  AGENTS: "agents",
  PROJECTS: "projects",
  UPLOADS: "upload",
} as const;

export type PanelViewType = (typeof PANEL_VIEWS)[keyof typeof PANEL_VIEWS];
