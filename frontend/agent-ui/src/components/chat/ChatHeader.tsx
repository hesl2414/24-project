type ChatHeaderProps = {
  title: string;
  agentName: string;
  site: string;
  messageCount: number;
};

export default function ChatHeader({ title, agentName, site, messageCount }: ChatHeaderProps) {
  return (
    <header className="border-b border-[var(--color-border)] bg-white/72 backdrop-blur-xl">
      <div className="flex items-center justify-between px-5 py-4 md:px-7">
        <div>
          <div className="text-[17px] font-semibold tracking-[-0.02em] text-[var(--color-text-main)]">
            {title}
          </div>
          <div className="mt-1 text-xs text-[var(--color-text-muted)]">
            AI Agent Conversation Workspace
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[var(--color-chip-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] ring-1 ring-[var(--color-border)]">
            {site}
          </span>
          <span className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)] ring-1 ring-[rgba(0,127,168,0.12)]">
            {agentName}
          </span>
          <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]">
            {messageCount} messages
          </span>
        </div>
      </div>
    </header>
  );
}
