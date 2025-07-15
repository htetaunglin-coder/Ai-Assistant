import { AppLayout as AppLayoutComponent } from "./app-layout";
import { getCookie } from "@/lib/cookies";
import React from "react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialActivePanel =
    (await getCookie("chat_panel_active_view")) || null;

  return (
    <AppLayoutComponent initialActivePanel={initialActivePanel}>
      {children}
    </AppLayoutComponent>
  );
}
