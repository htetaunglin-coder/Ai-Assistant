import { WorkspaceLayoutMainContainer } from "@/components/layout/workspace/workspace"
import { ConversationArea } from "./conversation-area"
import { PromptArea } from "./prompt-area"

/* -------------------------------------------------------------------------- */

const ChatView = () => {
  return (
    <WorkspaceLayoutMainContainer>
      <ConversationArea />
      <PromptArea />
    </WorkspaceLayoutMainContainer>
  )
}

export { ChatView }
