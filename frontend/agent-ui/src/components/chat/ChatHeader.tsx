type ChatHeaderProps = {
  title: string;
  agentName: string;
  site: string;
  messageCount: number;
};

export default function ChatHeader({ title, agentName, site, messageCount }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3 md:px-6 bg-[var(--color-surface)]">
      <div>
        <div className="text-sm font-medium text-[var(--color-text-main)]">{title}</div>
        <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">
          {agentName} · {site}
        </div>
      </div>

      <div className="rounded-full bg-[var(--color-chip-bg)] px-3 py-1.5 text-xs text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]">
        {messageCount} messages
      </div>
    </header>
  );
}
