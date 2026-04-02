type Agent = {
  code: string;
  name: string;
  description: string;
};

type AgentSidebarProps = {
  agents: Agent[];
  selectedAgentCode: string | null;
  isLoadingAgents: boolean;
  onSelectAgent: (agentCode: string) => void;
  onReloadAgents: () => void;
};

export default function AgentSidebar({
  agents,
  selectedAgentCode,
  isLoadingAgents,
  onSelectAgent,
  onReloadAgents,
}: AgentSidebarProps) {
  return (
    <aside className="hidden h-full w-[332px] shrink-0 border-l border-[var(--color-border)] bg-[var(--color-panel-bg)] xl:block">
      <div className="flex h-full flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.14)_100%)]">
        <div className="border-b border-[var(--color-border)] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-text-subtle)]">
                Agent Control
              </div>
              <div className="mt-2 text-lg font-semibold text-[var(--color-text-main)]">Available Agents</div>
              <div className="mt-1 text-xs text-[var(--color-text-muted)]">사용할 agent를 선택하세요</div>
            </div>
            <button
              onClick={onReloadAgents}
              className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)] transition hover:bg-[var(--color-surface-hover)]"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {isLoadingAgents ? (
            <div className="rounded-[22px] border border-dashed border-[var(--color-input-border)] bg-white/80 p-4 text-sm text-[var(--color-text-muted)] shadow-[var(--shadow-soft)]">
              Agent 목록 불러오는 중...
            </div>
          ) : (
            agents.map((agent) => {
              const active = agent.code === selectedAgentCode;
              return (
                <button
                  key={agent.code}
                  onClick={() => onSelectAgent(agent.code)}
                  className={`w-full rounded-[22px] border bg-white/86 p-4 text-left transition-all ${
                    active
                      ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)] shadow-[var(--shadow-soft)]"
                      : "border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[var(--color-text-main)]">{agent.name}</div>
                      <div className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-text-subtle)]">
                        {agent.code}
                      </div>
                    </div>
                    {active && (
                      <span className="rounded-full bg-[var(--color-accent)] px-2.5 py-1 text-[11px] font-semibold text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">{agent.description}</p>
                </button>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
