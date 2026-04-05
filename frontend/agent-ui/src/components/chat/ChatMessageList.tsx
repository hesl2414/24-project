import ChatMessage from "./ChatMessage";
import type { ChatDetailResponse } from "../../types/chat";

type AgentSummary = { code: string; name: string };

type ChatMessageListProps = {
  selectedChatId: string | null;
  selectedChatDetail: ChatDetailResponse | null;
  isSending: boolean;
  selectedAgentName: string;
  agents: AgentSummary[];
  onSubmitInput: (payload: { input_key?: string; value: string }) => Promise<void> | void;
  onApproveAction: (payload: {
    action_type?: string;
    payload: Record<string, any>;
  }) => Promise<void> | void;
  onRejectAction: () => Promise<void> | void;
};

function getAgentNameByCode(
  agentCode: string | null | undefined,
  agents: AgentSummary[]
) {
  if (!agentCode) return "Assistant";
  return agents.find((agent) => agent.code === agentCode)?.name || agentCode;
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

function findSubmittedValueForInput(messages: any[], currentIndex: number) {
  const nextUser = messages.slice(currentIndex + 1).find((m) => m.role === "user");
  return nextUser?.content ?? undefined;
}

function findSubmittedLabel(payload: any, submittedValue?: string) {
  if (!submittedValue || payload?.input_type !== "select") return undefined;
  const matched = payload?.input_options?.find((opt: any) => opt.value === submittedValue);
  return matched?.label;
}

export default function ChatMessageList({
  selectedChatId,
  selectedChatDetail,
  isSending,
  selectedAgentName,
  agents,
  onSubmitInput,
  onApproveAction,
  onRejectAction,
}: ChatMessageListProps) {
  const messages = selectedChatDetail?.messages ?? [];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--color-chat-bg)]">
      <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-4 pb-28 pt-6 md:px-6">
        {!selectedChatId ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="max-w-xl text-center">
              <h1 className="text-3xl font-semibold text-[var(--color-text-main)]">
                무엇을 도와드릴까요?
              </h1>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
                왼쪽에서 기존 채팅을 선택하거나 새 채팅을 만든 뒤, 오른쪽에서 agent를 고르고 메시지를 보내세요.
              </p>
            </div>
          </div>
        ) : messages.length ? (
          <div className="space-y-8">
            {messages.map((item, idx) => {
              const isUser = item.role === "user";
              const assistantPayload = !isUser ? parseAssistantPayload(item.content) : null;
              const isLatestMessage = idx === messages.length - 1;

              let normalizedPayload = assistantPayload;

              if (assistantPayload?.requires_input && !isLatestMessage) {
                const submittedValue = findSubmittedValueForInput(messages, idx);
                const submittedLabel = findSubmittedLabel(assistantPayload, submittedValue);

                normalizedPayload = {
                  ...assistantPayload,
                  submitted_value: submittedValue,
                  submitted_label: submittedLabel,
                  interaction_closed: true,
                };
              }

              if (assistantPayload?.action_required && !isLatestMessage) {
                normalizedPayload = {
                  ...assistantPayload,
                  interaction_closed: true,
                };
              }

              return (
                <div key={item.message_id} className="w-full">
                  <div
                    className={`mx-auto flex max-w-3xl gap-4 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-avatar-assistant-bg)] text-xs font-bold text-[var(--color-avatar-assistant-text)]">
                        AI
                      </div>
                    )}

                    <div className={`max-w-[85%] ${isUser ? "order-1" : "order-2"}`}>
                      <div
                        className={`mb-2 text-xs font-medium ${
                          isUser
                            ? "text-right text-[var(--color-text-muted)]"
                            : "text-[var(--color-text-muted)]"
                        }`}
                      >
                        {isUser ? "You" : getAgentNameByCode(item.agent_code, agents)}
                      </div>

                      <div
                        className={`rounded-3xl px-5 py-4 text-sm leading-7 shadow-sm ${
                          isUser
                            ? "bg-[var(--color-user-bubble-bg)] text-[var(--color-user-bubble-text)]"
                            : "bg-[var(--color-surface)] text-[var(--color-text-main)] ring-1 ring-[var(--color-border)]"
                        }`}
                      >
                        {isUser ? (
                          <div className="whitespace-pre-wrap">{item.content}</div>
                        ) : normalizedPayload ? (
                          <ChatMessage
                            message={normalizedPayload}
                            interactive={isLatestMessage}
                            onSubmitInput={onSubmitInput}
                            onApproveAction={onApproveAction}
                            onRejectAction={onRejectAction}
                          />
                        ) : (
                          <div className="whitespace-pre-wrap">{item.content}</div>
                        )}
                      </div>
                    </div>

                    {isUser && (
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-avatar-user-bg)] text-xs font-bold text-[var(--color-avatar-user-text)]">
                        U
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="mx-auto flex max-w-3xl gap-4">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-avatar-assistant-bg)] text-xs font-bold text-[var(--color-avatar-assistant-text)]">
                  AI
                </div>
                <div className="rounded-3xl bg-[var(--color-surface)] px-5 py-4 text-sm text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]">
                  응답 생성 중...
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="max-w-xl text-center">
              <h1 className="text-3xl font-semibold text-[var(--color-text-main)]">
                대화를 시작해보세요
              </h1>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
                현재 agent: {selectedAgentName}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}