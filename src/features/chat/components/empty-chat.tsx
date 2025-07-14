import { Bot } from "lucide-react";

export const EmptyChat = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Bot className="mb-4 size-16 text-secondary-foreground" />
      <h2 className="text-2xl font-semibold text-foreground">
        How can I help you today?
      </h2>
      <p className="text-secondary-foreground">
        Start a new conversation to begin.
      </p>
    </div>
  );
};
