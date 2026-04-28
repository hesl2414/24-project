import { useEffect, useMemo, useRef } from "react";
import WelcomeMessage from "../components/chat/WelcomeMessage";
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

function parseAssistantPayload(content: string) {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object" && "assistant_message" in parsed) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
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
    submitStructuredInput,
    approveAgentAction,
    rejectAgentAction,
    reloadChats,
  } = useChats({ selectedAgentCode, setSelectedAgentCode });

  useEffect(() => {
    if (isAdminSite(site)) navigate("/admin");
  }, [site, navigate]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChatDetail?.messages?.length, isSending]);

  // ── 마지막 AI 메시지의 requires_input 상태 추출 → ChatComposer로 전달 ──
  const pendingInput = useMemo(() => {
    const messages = selectedChatDetail?.messages ?? [];
    if (!messages.length) return null;

    // 가장 마지막 assistant 메시지 찾기
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role !== "user") {
        const payload = parseAssistantPayload(msg.content);
        if (payload?.requires_input) {
          // 이미 다음 user 메시지가 있으면 완료된 것 → null
          const hasNextUser = messages.slice(i + 1).some((m) => m.role === "user");
          if (hasNextUser) return null;

          return {
            input_type:        payload.input_type        ?? "text",
            input_key:         payload.input_key         ?? undefined,
            input_options:     payload.input_options     ?? undefined,
            input_fields:      payload.input_fields      ?? undefined,    
            assistant_message: payload.assistant_message ?? "",
          };
        }
        break;
      }
    }
    return null;
  }, [selectedChatDetail]);

  const filteredChats = useMemo(() => {
    const keyword = chatSearch.trim().toLowerCase();
    if (!keyword) return chats;
    return chats.filter((chat) => {
      const title   = chat.title?.toLowerCase() ?? "";
      const chatId  = chat.chat_id?.toLowerCase() ?? "";
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
    if (isAdminSite(value)) navigate("/admin");
  }

  function handleMessageKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-[var(--color-app-bg)] text-[var(--color-text-main)]">
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

        <section className="flex min-w-0 flex-1 flex-col bg-[var(--color-surface)]">
          <ChatHeader
            title={selectedChat?.title || "새 대화"}
            agentName={selectedAgent?.name || "Agent 선택 필요"}
            site={site}
            messageCount={selectedChatDetail?.messages?.length ?? 0}
          />

          {error && (
            <div className="mx-auto mt-4 w-full max-w-4xl px-4 md:px-6">
              <div className="rounded-2xl border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error)]">
                {error}
              </div>
            </div>
          )}

          {/* 웰컴 메시지: 메시지 없을 때만 표시 */}
          {!(selectedChatDetail?.messages?.length) && selectedChatId && (
            <WelcomeMessage
              siteCode={site || null}
              onQuery={(query, agentCode, pgmId) => {
                if (agentCode) setSelectedAgentCode(agentCode);
                setMessage(query);
                setTimeout(() => void sendMessage(pgmId), 0);
              }}
            />
          )}

          <ChatMessageList
            selectedChatId={selectedChatId}
            selectedChatDetail={selectedChatDetail}
            isSending={isSending}
            selectedAgentName={selectedAgent?.name || "미선택"}
            agents={agents}
            onSubmitInput={(payload) => void submitStructuredInput(payload)}
            onApproveAction={(payload) => void approveAgentAction(payload)}
            onRejectAction={() => void rejectAgentAction()}
            onSuggestedQuery={(query, agentCode) => {
              if (agentCode) setSelectedAgentCode(agentCode);
              setMessage(query);
              setTimeout(() => void sendMessage(), 0);
            }}
          />

          <div ref={messageEndRef} />

          <ChatComposer
            site={site}
            agentName={selectedAgent?.name || "미선택"}
            chatTitle={selectedChat?.title}
            selectedAgentCode={selectedAgentCode}
            selectedChatId={selectedChatId}
            message={message}
            onMessageChange={(value) => { setError(null); setMessage(value); }}
            onKeyDown={handleMessageKeyDown}
            onSend={() => void sendMessage()}
            isSending={isSending}
            // ── HITL 주입 ──
            pendingInput={pendingInput}
            onSubmitInput={(payload) => void submitStructuredInput(payload)}
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
