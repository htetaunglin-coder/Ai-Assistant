import React, { Suspense } from "react";
import { ChatLayout } from "./chat-layout";
import { EmptyChat } from "./components/empty-chat";

type ChatViewProps = {
  initialActivePanel: string | null;
};

const ChatView = ({ initialActivePanel }: ChatViewProps) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatLayout initialActivePanel={initialActivePanel}>
        <EmptyChat />
      </ChatLayout>
    </Suspense>
  );
};

export { ChatView };
