import { AuthStoreProvider } from "@/features/auth/stores/auth-store-provider";
import { AppLayout as AppLayoutComponent } from "./app-layout";
import { getCookie } from "@/lib/cookies";
import React from "react";
import { getCurrentUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialActivePanel =
    (await getCookie("chat_panel_active_view")) || null;

  const user = await getCurrentUser();

  // Temporary user info used before backend auth API is available
  const TEMP_USER_INFO_UNTIL_AUTH_READY = {
    id: "1",
    username: "Htet Aung Lin",
    email: "htetaunglin.coder@gmail.com",
    gender: "male",
    image: "/images/avatar.jpg",
    role: "frontend-developer",
  };

  const initialState = {
    user: user && TEMP_USER_INFO_UNTIL_AUTH_READY,
    isAuthenticated: !!user,
    isLoading: false,
  };

  return (
    <AuthStoreProvider initialState={initialState}>
      <AppLayoutComponent initialActivePanel={initialActivePanel}>
        {children}
      </AppLayoutComponent>
    </AuthStoreProvider>
  );
}
