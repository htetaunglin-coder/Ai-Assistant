import { ChatView } from "@/features/chat/chat-view";
import { getCookie } from "@/lib/cookies";

const ChatPage = async () => {
  const initialActivePanel =
    (await getCookie("chat_panel_active_view")) || null;

  return <ChatView initialActivePanel={initialActivePanel} />;
};

export default ChatPage;
