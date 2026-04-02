import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AgentSidebar from "../components/chat/AgentSidebar";
import ChatComposer from "../components/chat/ChatComposer";
import ChatHeader from "../components/chat/ChatHeader";
import ChatMessageList from "../components/chat/ChatMessageList";
import ChatSidebar from "../components/chat/ChatSidebar";
import { isAdminSite } from "../config/theme";
import { useAgents } from "../hooks/useAgents";
import { useChats } from "../hooks/useChats";

function getChatPreview(messages?: Array<{ content: string }>) {
  if (!messages?.length) return "대화를 시작해보세요";
  return messages[messages.length - 1].content;
}

export default function AgentChatDashboard() {
  const navigate = useNavigate();
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const {
    agents,
    selectedAgentCode,
    selectedAgent,
    isLoadingAgents,
    setSelectedAgentCode,
    reloadAgents,
  } = useAgents();

  const {
    site,
    setSite,
    userId,
    setUserId,
    chats,
    chatDetails,
    selectedChatId,
    selectedChat,
    selectedChatDetail,
    message,
    setMessage,
    chatSearch,
    setChatSearch,
    isLoadingChats,
    isSending,
    error,
    setError,
    selectChat,
    createNewChat,
    sendMessage,
    reloadChats,
  } = useChats({
    selectedAgentCode,
    setSelectedAgentCode,
  });

  useEffect(() => {
    if (isAdminSite(site)) {
      navigate("/admin");
    }
  }, [site, navigate]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChatDetail?.messages?.length, isSending]);

  const filteredChats = useMemo(() => {
    const keyword = chatSearch.trim().toLowerCase();
    if (!keyword) return chats;

    return chats.filter((chat) => {
      const title = chat.title?.toLowerCase() ?? "";
      const chatId = chat.chat_id?.toLowerCase() ?? "";
      const agentCode = chat.agent_code?.toLowerCase() ?? "";
      const preview = getChatPreview(chatDetails[chat.chat_id]?.messages).toLowerCase();
      return (
        title.includes(keyword) ||
        chatId.includes(keyword) ||
        agentCode.includes(keyword) ||
        preview.includes(keyword)
      );
    });
  }, [chats, chatSearch, chatDetails]);

  function handleSiteChange(value: string) {
    setSite(value);
    if (isAdminSite(value)) {
      navigate("/admin");
    }
  }

  function handleMessageKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="h-screen overflow-hidden text-[var(--color-text-main)]" style={{ background: "var(--color-app-bg-gradient)" }}>
      <div className="flex h-full">
        <ChatSidebar
          site={site}
          onSiteChange={handleSiteChange}
          userId={userId}
          onUserIdChange={setUserId}
          chatSearch={chatSearch}
          onChatSearchChange={setChatSearch}
          filteredChats={filteredChats}
          chatDetails={chatDetails}
          selectedChatId={selectedChatId}
          isLoadingChats={isLoadingChats}
          onCreateChat={() => void createNewChat()}
          onReloadChats={() => void reloadChats()}
          onSelectChat={(chatId) => void selectChat(chatId)}
        />

        <section className="flex min-w-0 flex-1 flex-col bg-white/24 backdrop-blur-[2px]">
          <ChatHeader
            title={selectedChat?.title || "새 대화"}
            agentName={selectedAgent?.name || "Agent 선택 필요"}
            site={site}
            messageCount={selectedChatDetail?.messages?.length ?? 0}
          />

          {error && (
            <div className="mx-auto mt-4 w-full max-w-4xl px-4 md:px-6">
              <div className="rounded-[20px] border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error)] shadow-[var(--shadow-soft)]">
                {error}
              </div>
            </div>
          )}

          <ChatMessageList
            selectedChatId={selectedChatId}
            selectedChatDetail={selectedChatDetail}
            isSending={isSending}
            selectedAgentName={selectedAgent?.name || "미선택"}
            agents={agents}
          />
          <div ref={messageEndRef} />

          <ChatComposer
            site={site}
            agentName={selectedAgent?.name || "미선택"}
            chatTitle={selectedChat?.title}
            selectedAgentCode={selectedAgentCode}
            selectedChatId={selectedChatId}
            message={message}
            onMessageChange={(value) => {
              setError(null);
              setMessage(value);
            }}
            onKeyDown={handleMessageKeyDown}
            onSend={() => void sendMessage()}
            isSending={isSending}
          />
        </section>

        <AgentSidebar
          agents={agents}
          selectedAgentCode={selectedAgentCode}
          isLoadingAgents={isLoadingAgents}
          onSelectAgent={setSelectedAgentCode}
          onReloadAgents={() => void reloadAgents()}
        />
      </div>
    </div>
  );
}
