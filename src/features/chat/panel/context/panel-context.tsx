"use client";

import { createContext } from "@/utils/create-context";
import React, { useCallback, useState } from "react";

const CHAT_PANEL_COOKIE_NAME = "chat_panel_active_view";
const CHAT_PANEL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

type PanelContextType = {
  activePanel: string | null;
  setActivePanel: (panel: string | null) => void;
  isOpen: boolean;
};

const [PanelContextProvider, usePanelContext] = createContext<PanelContextType>(
  {
    name: "PanelContext",
    strict: true,
  }
);

type PanelProviderProps = {
  initialActivePanel: string | null;
  children: React.ReactNode;
};

const PanelProvider = ({
  initialActivePanel,
  children,
}: PanelProviderProps) => {
  const [activePanel, setActivePanel] = useState<string | null>(
    initialActivePanel
  );

  const handleSetActivePanel = useCallback((panel: string | null) => {
    setActivePanel(panel);
    if (typeof document !== "undefined") {
      document.cookie = `${CHAT_PANEL_COOKIE_NAME}=${
        panel || ""
      }; path=/; max-age=${CHAT_PANEL_COOKIE_MAX_AGE}; SameSite=Lax; Secure`;
    }
  }, []);

  const isOpen = !!activePanel;

  return (
    <PanelContextProvider
      value={{ activePanel, setActivePanel: handleSetActivePanel, isOpen }}>
      {children}
    </PanelContextProvider>
  );
};

export { PanelProvider, usePanelContext };
