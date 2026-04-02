import type { ChatDetailResponse, ChatSession } from "../../types/chat";
import SiteSelect from "./SiteSelect";

type ChatSidebarProps = {
  site: string;
  onSiteChange: (value: string) => void;
  userId: string;
  onUserIdChange: (value: string) => void;
  chatSearch: string;
  onChatSearchChange: (value: string) => void;
  filteredChats: ChatSession[];
  chatDetails: Record<string, ChatDetailResponse>;
  selectedChatId: string | null;
  isLoadingChats: boolean;
  onCreateChat: () => void;
  onReloadChats: () => void;
  onSelectChat: (chatId: string) => void;
};

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

export default function ChatSidebar({
  site,
  onSiteChange,
  userId,
  onUserIdChange,
  chatSearch,
  onChatSearchChange,
  filteredChats,
  chatDetails,
  selectedChatId,
  isLoadingChats,
  onCreateChat,
  onReloadChats,
  onSelectChat,
}: ChatSidebarProps) {
  return (
    <aside className="hidden h-full w-[290px] shrink-0 border-r border-[var(--color-border)] bg-[var(--color-sidebar-bg)] lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-[var(--color-border)] p-3">
          <div className="space-y-3">
            <SiteSelect site={site} onChange={onSiteChange} />

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                User ID
              </label>
              <input
                value={userId}
                onChange={(e) => onUserIdChange(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-primary)]"
                placeholder="user1"
              />
            </div>

            <input
              value={chatSearch}
              onChange={(e) => onChatSearchChange(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-primary)]"
              placeholder="채팅 검색"
            />
          </div>
        </div>

        <div className="p-3">
          <button
            onClick={onCreateChat}
            className="flex w-full items-center justify-center rounded-xl border border-[var(--color-input-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-text-main)] transition hover:bg-[var(--color-surface-hover)]"
          >
            + 새 채팅
          </button>
        </div>

        <div className="flex items-center justify-between px-3 py-3 text-xs text-[var(--color-text-muted)]">
          <span>{isLoadingChats ? "불러오는 중..." : `${filteredChats.length} chats`}</span>
          <button
            onClick={onReloadChats}
            className="rounded-lg px-2 py-1 transition hover:bg-[var(--color-surface)]"
          >
            새로고침
          </button>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
          {filteredChats.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--color-input-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text-muted)]">
              채팅이 없습니다.
            </div>
          ) : (
            filteredChats.map((chat) => {
              const active = chat.chat_id === selectedChatId;
              const preview = getChatPreview(chatDetails[chat.chat_id]?.messages);
              return (
                <button
                  key={chat.chat_id}
                  onClick={() => onSelectChat(chat.chat_id)}
                  className={`w-full rounded-xl px-3 py-3 text-left transition ${
                    active
                      ? "bg-[var(--color-surface)] shadow-sm ring-1 ring-[var(--color-border-strong)]"
                      : "hover:bg-[var(--color-surface)]/80"
                  }`}
                >
                  <div className="truncate text-sm font-medium text-[var(--color-text-main)]">
                    {chat.title || "New Chat"}
                  </div>
                  <div className="mt-1 truncate text-xs text-[var(--color-text-muted)]">{preview}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--color-text-subtle)]">
                    <span className="truncate">{chat.agent_code || "agent 미지정"}</span>
                    <span>{formatDateLabel(chat.updated_at)}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-[var(--color-border)] p-3 text-xs text-[var(--color-text-muted)]">
          <div className="rounded-xl bg-[var(--color-surface)] px-3 py-3 ring-1 ring-[var(--color-border)]">
            <div className="font-medium text-[var(--color-text-main)]">{userId || "user1"}</div>
            <div className="mt-1">{site}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
