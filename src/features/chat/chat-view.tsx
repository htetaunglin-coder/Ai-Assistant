"use client";

import {
  AIInput,
  AIInputButton,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@/components/ai-input";
import { Button, ScrollArea } from "@mijn-ui/react";
import { GlobeIcon, Paperclip, Telescope } from "lucide-react";
import { type FormEventHandler, useState } from "react";
import { SUGGESTION_ITEMS } from "./constants";

const ChatView = () => {
  const [text, setText] = useState<string>("");
  const [status, setStatus] = useState<
    "submitted" | "streaming" | "ready" | "error"
  >("ready");

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (!text) {
      return;
    }

    setStatus("submitted");

    setTimeout(() => {
      setStatus("streaming");
    }, 200);

    setTimeout(() => {
      setStatus("ready");
    }, 2000);
  };

  return (
    <ScrollArea className="flex h-[calc(100vh-2rem)] w-full">
      <div className="mx-auto flex size-full h-[calc(100vh-2rem-var(--header-height))] max-w-3xl flex-col items-center justify-center gap-4">
        <h1 className="mb-4 w-full text-xl font-medium">
          Hello There! <br />
          <span className="text-muted-foreground">
            How can I help you today?
          </span>
        </h1>
        <AIInput onSubmit={handleSubmit}>
          <AIInputTextarea
            onChange={(e) => setText(e.target.value)}
            value={text}
          />
          <AIInputToolbar>
            <AIInputTools>
              <AIInputButton iconOnly>
                <Paperclip size={16} />
              </AIInputButton>
              <AIInputButton iconOnly>
                <Telescope size={16} />
              </AIInputButton>
              <AIInputButton>
                <GlobeIcon size={16} />
                <span>Search</span>
              </AIInputButton>
            </AIInputTools>
            <AIInputSubmit disabled={!text} status={status} />
          </AIInputToolbar>
        </AIInput>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {SUGGESTION_ITEMS.map((item) => (
            <Button key={item.id} size="sm" className="gap-2">
              {item.icon}
              {item.text}
            </Button>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

export { ChatView };
