type ChatComposerProps = {
  site: string;
  agentName: string;
  chatTitle?: string;
  selectedAgentCode: string | null;
  selectedChatId: string | null;
  message: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isSending: boolean;
};

export default function ChatComposer({
  site,
  agentName,
  chatTitle,
  selectedAgentCode,
  selectedChatId,
  message,
  onMessageChange,
  onSend,
  onKeyDown,
  isSending,
}: ChatComposerProps) {
  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 px-4 py-4 backdrop-blur md:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span className="rounded-full bg-[var(--color-chip-bg)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">Site: {site}</span>
          <span className="rounded-full bg-[var(--color-chip-bg)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">Agent: {agentName}</span>
          {chatTitle && (
            <span className="rounded-full bg-[var(--color-chip-bg)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">Chat: {chatTitle}</span>
          )}
        </div>

        <div className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-lg shadow-[var(--color-shadow-soft)]">
          <textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={onKeyDown}
            rows={3}
            placeholder={selectedAgentCode ? "메시지를 입력하세요. Enter로 전송, Shift+Enter로 줄바꿈" : "오른쪽에서 agent를 먼저 선택하세요"}
            className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-7 text-[var(--color-text-main)] outline-none placeholder:text-[var(--color-text-subtle)]"
          />
          <div className="mt-2 flex items-center justify-between gap-3 px-2 pb-1">
            <div className="text-xs text-[var(--color-text-subtle)]">
              {selectedChatId ? "기존 채팅에 이어서 대화합니다" : "전송 시 새 채팅이 생성될 수 있습니다"}
            </div>
            <button
              onClick={onSend}
              disabled={isSending || !selectedAgentCode || !message.trim()}
              className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-contrast)] transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSending ? "전송 중" : "전송"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
