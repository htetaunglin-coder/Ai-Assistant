import { ConversationArea } from "./components/conversation-area"
import { PromptArea } from "./components/prompt-area"

/* -------------------------------------------------------------------------- */

const ChatView = () => {
  return (
    <div className="relative h-[calc(100svh_-_var(--header-height))] md:h-[calc(100svh_-_var(--main-area-padding)_-_0.5rem)]">
      <ConversationArea />
      <PromptArea />
    </div>
  )
}

export { ChatView }
