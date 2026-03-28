import { useMemo, useRef } from "react";
import { useAgents } from "../hooks/useAgents";
import { useChats } from "../hooks/useChats";

function formatDateLabel(dateText?: string) {
  if (!dateText) return "";
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return dateText;
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getChatPreview(messages?: Array<{ content: string }>) {
  if (!messages?.length) return "대화를 시작해보세요";
  return messages[messages.length - 1].content;
}

export default function AgentChatDashboard() {
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

  const sites = ["KOR-SEOUL", "KOR-CHEONAN", "VN-HANOI", "CN-SUZHOU"];

  function handleMessageKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
      setTimeout(() => messageEndRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
    }
  }

  function getAgentNameByCode(
    agentCode: string | null | undefined,
    agents: Array<{ code: string; name: string }>
  ) {
    if (!agentCode) return "Assistant";
    return agents.find((agent) => agent.code === agentCode)?.name || agentCode;
  }

  return (
    <div className="h-screen overflow-hidden bg-[#f7f7f8] text-slate-800">
      <div className="flex h-full">
        <aside className="hidden h-full w-[290px] shrink-0 border-r border-slate-200 bg-[#f0f1f3] lg:block">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 p-3">

              <div className="space-y-3">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Site
                  </label>
                  <select
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400"
                  >
                    {sites.map((siteItem) => (
                      <option key={siteItem}>{siteItem}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    User ID
                  </label>
                  <input
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    placeholder="user1"
                  />
                </div>

                <input
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                  placeholder="채팅 검색"
                />
              </div>
              
            </div>

            <div className="border-slate-200 p-3">
              <button
                onClick={() => void createNewChat()}
                className="flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
              >
                + 새 채팅
            </button>
            </div>

            <div className="flex items-center justify-between px-3 py-3 text-xs text-slate-500">
              <span>{isLoadingChats ? "불러오는 중..." : `${filteredChats.length} chats`}</span>
              <button
                onClick={() => void reloadChats()}
                className="rounded-lg px-2 py-1 transition hover:bg-white/70"
              >
                새로고침
              </button>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
              {filteredChats.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                  채팅이 없습니다.
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const active = chat.chat_id === selectedChatId;
                  const preview = getChatPreview(chatDetails[chat.chat_id]?.messages);
                  return (
                    <button
                      key={chat.chat_id}
                      onClick={() => void selectChat(chat.chat_id)}
                      className={`w-full rounded-xl px-3 py-3 text-left transition ${
                        active ? "bg-white shadow-sm ring-1 ring-slate-200" : "hover:bg-white/80"
                      }`}
                    >
                      <div className="truncate text-sm font-medium text-slate-800">{chat.title || "New Chat"}</div>
                      <div className="mt-1 truncate text-xs text-slate-500">{preview}</div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="truncate">{chat.agent_code || "agent 미지정"}</span>
                        <span>{formatDateLabel(chat.updated_at)}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="border-t border-slate-200 p-3 text-xs text-slate-500">
              <div className="rounded-xl bg-white px-3 py-3 ring-1 ring-slate-200">
                <div className="font-medium text-slate-700">{userId || "user1"}</div>
                <div className="mt-1">{site}</div>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-white">
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 md:px-6">
            <div>
              <div className="text-sm font-medium text-slate-800">{selectedChat?.title || "새 대화"}</div>
              <div className="mt-0.5 text-xs text-slate-500">
                {selectedAgent?.name || "Agent 선택 필요"} · {site}
              </div>
            </div>

            <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600 ring-1 ring-slate-200">
              {selectedChatDetail?.messages?.length ?? 0} messages
            </div>
          </header>

          {error && (
            <div className="mx-auto mt-4 w-full max-w-4xl px-4 md:px-6">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#fafafa]">
            <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-4 pb-28 pt-6 md:px-6">
              {!selectedChatId ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="max-w-xl text-center">
                    <h1 className="text-3xl font-semibold text-slate-800">무엇을 도와드릴까요?</h1>
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      왼쪽에서 기존 채팅을 선택하거나 새 채팅을 만든 뒤, 오른쪽에서 agent를 고르고 메시지를 보내세요.
                    </p>
                  </div>
                </div>
              ) : selectedChatDetail?.messages?.length ? (
                <div className="space-y-8">
                  {selectedChatDetail.messages.map((item) => {
                    const isUser = item.role === "user";
                    return (
                      <div key={item.message_id} className="w-full">
                        <div className={`mx-auto flex max-w-3xl gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
                          {!isUser && (
                            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
                              AI
                            </div>
                          )}

                          <div className={`max-w-[85%] ${isUser ? "order-1" : "order-2"}`}>
                            <div className={`mb-2 text-xs font-medium ${isUser ? "text-right text-slate-500" : "text-slate-500"}`}>
                              {isUser ? "You" : getAgentNameByCode(item.agent_code, agents)}
                            </div>
                            <div
                              className={`rounded-3xl px-5 py-4 text-sm leading-7 shadow-sm ${
                                isUser
                                  ? "bg-slate-700 text-white"
                                  : "bg-white text-slate-800 ring-1 ring-slate-200"
                              }`}
                            >
                              <div className="whitespace-pre-wrap">{item.content}</div>
                            </div>
                          </div>

                          {isUser && (
                            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-slate-700">
                              U
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {isSending && (
                    <div className="mx-auto flex max-w-3xl gap-4">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
                        AI
                      </div>
                      <div className="rounded-3xl bg-white px-5 py-4 text-sm text-slate-500 ring-1 ring-slate-200">
                        응답 생성 중...
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  <div className="max-w-xl text-center">
                    <h1 className="text-3xl font-semibold text-slate-800">대화를 시작해보세요</h1>
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      현재 agent: {selectedAgent?.name || "미선택"}
                    </p>
                  </div>
                </div>
              )}
              <div ref={messageEndRef} />
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 ring-1 ring-slate-200">Site: {site}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 ring-1 ring-slate-200">
                  Agent: {selectedAgent?.name || "미선택"}
                </span>
                {selectedChat && (
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 ring-1 ring-slate-200">Chat: {selectedChat.title}</span>
                )}
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-lg">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleMessageKeyDown}
                  rows={3}
                  placeholder={selectedAgentCode ? "메시지를 입력하세요. Enter로 전송, Shift+Enter로 줄바꿈" : "오른쪽에서 agent를 먼저 선택하세요"}
                  className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400"
                />
                <div className="mt-2 flex items-center justify-between gap-3 px-2 pb-1">
                  <div className="text-xs text-slate-400">
                    {selectedChatId ? "기존 채팅에 이어서 대화합니다" : "전송 시 새 채팅이 생성될 수 있습니다"}
                  </div>
                  <button
                    onClick={() => void sendMessage()}
                    disabled={isSending || !selectedAgentCode || !message.trim()}
                    className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isSending ? "전송 중" : "전송"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="hidden h-full w-[320px] shrink-0 border-l border-slate-200 bg-[#f6f7f8] xl:block">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-800">Agents</div>
                  <div className="mt-1 text-xs text-slate-500">사용할 agent를 선택하세요</div>
                </div>
                <button
                  onClick={() => void reloadAgents()}
                  className="rounded-lg px-3 py-2 text-xs text-slate-600 transition hover:bg-white"
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {isLoadingAgents ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                  Agent 목록 불러오는 중...
                </div>
              ) : (
                agents.map((agent) => {
                  const active = agent.code === selectedAgentCode;
                  return (
                    <button
                      key={agent.code}
                      onClick={() => setSelectedAgentCode(agent.code)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-slate-400 bg-white shadow-sm"
                          : "border-slate-200 bg-white/70 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-800">{agent.name}</div>
                          <div className="mt-1 text-xs text-slate-500">{agent.code}</div>
                        </div>
                        {active && (
                          <span className="rounded-full bg-slate-800 px-2 py-1 text-[11px] font-semibold text-white">
                            선택됨
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-500">{agent.description}</p>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
