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
    <aside className="hidden h-full w-[312px] shrink-0 border-r border-[var(--color-border-on-dark)] bg-[var(--color-primary)] lg:block">
      <div
        className="flex h-full flex-col"
        style={{ background: "var(--color-sidebar-bg)", color: "var(--color-text-on-dark)" }}
      >
        <div className="border-b border-[var(--color-border-on-dark)] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-text-on-dark-subtle)]">
                Hyundai AI Chat
              </div>
              <div className="mt-2 text-xl font-semibold text-[var(--color-text-on-dark)]">
                Deep Blue Console
              </div>
            </div>
            <div className="rounded-full border border-[var(--color-border-on-dark)] bg-[var(--color-dark-surface)] px-3 py-1 text-[11px] font-semibold text-[var(--color-text-on-dark-muted)]">
              LIVE
            </div>
          </div>

          <div className="space-y-4 rounded-[24px] border border-[var(--color-border-on-dark)] bg-[var(--color-dark-surface)] p-4 backdrop-blur-xl">
            <SiteSelect site={site} onChange={onSiteChange} dark />

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-text-on-dark-subtle)]">
                User ID
              </label>
              <input
                value={userId}
                onChange={(e) => onUserIdChange(e.target.value)}
                className="w-full rounded-2xl border-none bg-[var(--color-dark-input)] px-3 py-3 text-sm text-[var(--color-text-on-dark)] shadow-[inset_0_0_0_1px_var(--color-border-on-dark-strong)] outline-none transition placeholder:text-[var(--color-text-on-dark-subtle)] focus:bg-[var(--color-dark-input-hover)] focus:shadow-[inset_0_0_0_1px_var(--color-accent),var(--shadow-focus)]"
                placeholder="user1"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-text-on-dark-subtle)]">
                Search
              </label>
              <input
                value={chatSearch}
                onChange={(e) => onChatSearchChange(e.target.value)}
                className="w-full rounded-2xl border-none bg-[var(--color-dark-input)] px-3 py-3 text-sm text-[var(--color-text-on-dark)] shadow-[inset_0_0_0_1px_var(--color-border-on-dark-strong)] outline-none transition placeholder:text-[var(--color-text-on-dark-subtle)] focus:bg-[var(--color-dark-input-hover)] focus:shadow-[inset_0_0_0_1px_var(--color-accent),var(--shadow-focus)]"
                placeholder="채팅 검색"
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={onCreateChat}
            className="flex w-full items-center justify-center rounded-2xl bg-[var(--color-accent)] px-4 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(0,127,168,0.25)] transition hover:bg-[var(--color-accent-hover)] active:scale-[0.99]"
          >
            + NEW CHAT
          </button>
        </div>

        <div className="flex items-center justify-between px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-on-dark-subtle)]">
          <span>{isLoadingChats ? "Syncing..." : `${filteredChats.length} Chats`}</span>
          <button
            onClick={onReloadChats}
            className="rounded-full px-2 py-1 transition hover:bg-[var(--color-dark-surface)] hover:text-[var(--color-text-on-dark)]"
          >
            Refresh
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-4">
          {filteredChats.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[var(--color-border-on-dark-strong)] bg-[var(--color-dark-surface)] p-4 text-sm text-[var(--color-text-on-dark-muted)] backdrop-blur-md">
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
                  className={`w-full rounded-[20px] px-4 py-4 text-left transition-all duration-200 ${
                    active
                      ? "bg-[var(--color-dark-surface-active)] shadow-[0_12px_28px_rgba(0,0,0,0.12)] ring-1 ring-[var(--color-accent)]"
                      : "hover:bg-[var(--color-dark-surface)]"
                  }`}
                >
                  <div className={`truncate text-sm font-bold ${active ? "text-white" : "text-[var(--color-text-on-dark-muted)]"}`}>
                    {chat.title || "New Chat"}
                  </div>
                  <div className="mt-1 truncate text-xs text-[var(--color-text-on-dark-subtle)]">{preview}</div>
                  <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-on-dark-subtle)]">
                    <span className="max-w-[50%] truncate">{chat.agent_code || "N/A"}</span>
                    <span>{formatDateLabel(chat.updated_at)}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-[var(--color-border-on-dark)] p-4">
          <div className="rounded-[20px] border border-[var(--color-border-on-dark)] bg-[var(--color-dark-surface)] px-4 py-3 backdrop-blur-xl">
            <div className="text-sm font-semibold text-white">{userId || "user1"}</div>
            <div className="mt-1 text-xs text-[var(--color-text-on-dark-subtle)]">{site}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
