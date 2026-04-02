import type { AgentResponse, ChatDetailResponse } from "../../types/chat";

type ChatMessageListProps = {
  selectedChatId: string | null;
  selectedChatDetail: ChatDetailResponse | null;
  isSending: boolean;
  selectedAgentName: string;
  agents: AgentResponse[];
};

function getAgentNameByCode(agentCode?: string, agents: AgentResponse[] = []) {
  if (!agentCode) return "Assistant";
  return agents.find((agent) => agent.code === agentCode)?.name || agentCode;
}

export default function ChatMessageList({
  selectedChatId,
  selectedChatDetail,
  isSending,
  selectedAgentName,
  agents,
}: ChatMessageListProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto" style={{ background: "var(--color-app-bg-gradient)" }}>
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-6 pb-28 pt-8">
        {!selectedChatId ? (
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="max-w-2xl rounded-[30px] border border-white/60 bg-white/70 px-10 py-12 text-center shadow-[var(--shadow-card)] backdrop-blur-xl">
              <div className="inline-flex rounded-full bg-[var(--color-chip-bg)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Hyundai Deep Blue Experience
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-[var(--color-text-main)]">
                무엇을 도와드릴까요?
              </h1>
              <p className="mt-4 text-sm leading-8 text-[var(--color-text-muted)]">
                왼쪽에서 기존 채팅을 선택하거나 새 채팅을 만든 뒤, 오른쪽 패널에서 agent를 고르고
                메시지를 보내세요.
              </p>
            </div>
          </div>
        ) : selectedChatDetail?.messages?.length ? (
          <div className="space-y-8">
            {selectedChatDetail.messages.map((item) => {
              const isUser = item.role === "user";
              return (
                <div key={item.message_id} className="w-full">
                  <div className={`mx-auto flex max-w-4xl gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
                    {!isUser && (
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-avatar-assistant-bg)] text-xs font-bold text-[var(--color-avatar-assistant-text)] shadow-[var(--shadow-soft)]">
                        AI
                      </div>
                    )}

                    <div className={`max-w-[82%] ${isUser ? "order-1" : "order-2"}`}>
                      <div className={`mb-2 text-xs font-semibold ${isUser ? "text-right text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"}`}>
                        {isUser ? "You" : getAgentNameByCode(item.agent_code, agents)}
                      </div>
                      <div
                        className={`px-5 py-4 text-sm leading-7 shadow-[var(--shadow-soft)] ${
                          isUser
                            ? "rounded-[24px] text-[var(--color-user-bubble-text)]"
                            : "rounded-[24px] border border-[var(--color-border)] bg-[var(--color-assistant-bubble-bg)] text-[var(--color-assistant-bubble-text)] backdrop-blur-md"
                        }`}
                        style={isUser ? { background: "var(--color-user-bubble-bg)" } : undefined}
                      >
                        <div className="whitespace-pre-wrap">{item.content}</div>
                      </div>
                    </div>

                    {isUser && (
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-avatar-user-bg)] text-xs font-bold text-[var(--color-avatar-user-text)] shadow-[var(--shadow-soft)]">
                        U
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="mx-auto flex max-w-4xl gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-avatar-assistant-bg)] text-xs font-bold text-[var(--color-avatar-assistant-text)] shadow-[var(--shadow-soft)]">
                  AI
                </div>
                <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-assistant-bubble-bg)] px-5 py-4 text-sm text-[var(--color-text-muted)] shadow-[var(--shadow-soft)] backdrop-blur-md">
                  응답 생성 중...
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="max-w-xl rounded-[30px] border border-white/60 bg-white/70 px-10 py-12 text-center shadow-[var(--shadow-card)] backdrop-blur-xl">
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--color-text-main)]">
                대화를 시작해보세요
              </h1>
              <p className="mt-4 text-sm leading-8 text-[var(--color-text-muted)]">
                현재 선택된 agent는 <span className="font-semibold text-[var(--color-primary)]">{selectedAgentName}</span>
                입니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
