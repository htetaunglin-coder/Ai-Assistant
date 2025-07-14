"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarIcon,
  SidebarItem,
  SidebarProvider,
  SidebarToggler,
} from "@/components/ui/sidebar";
import { sidebarNavItems } from "@/features/chat/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  ResizableLayoutContent,
  ResizableLayoutGroup,
  ResizableLayoutPanel,
  ResizableLayoutProvider,
  useResizableLayoutContext,
} from "./components/resizable-layout";
import {
  PanelProvider,
  usePanelContext,
} from "./panel/context/panel-context";
import { DynamicPanelContent } from "./panel/components/dynamic-panel-content";

type ChatLayoutProps = {
  initialActivePanel: string | null;
  children: React.ReactNode;
};

const ChatLayout = ({ children, initialActivePanel }: ChatLayoutProps) => {
  return (
    <PanelProvider initialActivePanel={initialActivePanel}>
      <ChatLayoutContent>{children}</ChatLayoutContent>
    </PanelProvider>
  );
};

const ChatLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, setActivePanel } = usePanelContext();

  return (
    <ResizableLayoutProvider
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setActivePanel(null);
        }
      }}>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-background">
          <Sidebar>
            <SidebarContent>
              <SidebarIcon asChild>
                <Link
                  href="/chat"
                  className="flex size-11 items-center justify-center rounded-md !p-1.5">
                  <Image
                    src="/images/picosbs.png"
                    width={44}
                    height={44}
                    alt="Picosbs"
                  />
                </Link>
              </SidebarIcon>

              <SidebarItems />
            </SidebarContent>
          </Sidebar>

          <SidebarToggler className="fixed bottom-8 left-4 z-50 text-lg text-secondary-foreground transition-all duration-300 hover:text-foreground data-[state=open]:bottom-4 data-[state=open]:left-5" />

          <div className="h-full grow p-4 pl-0">
            <main className="size-full rounded-md border border-border-secondary bg-secondary">
              <ResizableLayoutGroup>
                <ResizableLayoutPanel>
                  <DynamicPanelContent />
                </ResizableLayoutPanel>
                <ResizableLayoutContent>{children}</ResizableLayoutContent>
              </ResizableLayoutGroup>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ResizableLayoutProvider>
  );
};

const SidebarItems = () => {
  const { setActivePanel } = usePanelContext();
  const { onOpenChange: onResizableOpenChange } = useResizableLayoutContext();

  return sidebarNavItems.map((item) => {
    const Icon = item.icon;

    if (item.href) {
      return (
        <SidebarItem
          asChild
          key={item.title}
          tooltip={item.tooltip}
          onClick={() => {
            setActivePanel(null);
          }}>
          <Link href={item.href}>
            <SidebarIcon>
              <Icon />
            </SidebarIcon>
            <p className="text-xs">{item.title}</p>
          </Link>
        </SidebarItem>
      );
    }

    return (
      <SidebarItem
        key={item.title}
        tooltip={item.tooltip}
        onClick={() => {
          if (item.panelId) {
            onResizableOpenChange(true);
            setActivePanel(item.panelId);
          }
        }}>
        <SidebarIcon>
          <Icon />
        </SidebarIcon>
        <p className="text-xs">{item.title}</p>
      </SidebarItem>
    );
  });
};

export { ChatLayout };
