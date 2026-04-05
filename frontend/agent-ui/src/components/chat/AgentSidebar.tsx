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
    <aside className="hidden h-full w-[320px] shrink-0 border-l border-[var(--color-border)] bg-[var(--color-panel-bg)] xl:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-[var(--color-border)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[var(--color-text-main)]">Agents</div>
              <div className="mt-1 text-xs text-[var(--color-text-muted)]">사용할 agent를 선택하세요</div>
            </div>
            <button
              onClick={onReloadAgents}
              className="rounded-lg px-3 py-2 text-xs text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface)]"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {isLoadingAgents ? (
            <div className="rounded-2xl border border-dashed border-[var(--color-input-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text-muted)]">
              Agent 목록 불러오는 중...
            </div>
          ) : (
            agents.map((agent) => {
              const active = agent.code === selectedAgentCode;
              return (
                <button
                  key={agent.code}
                  onClick={() => onSelectAgent(agent.code)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-[var(--color-primary)] bg-[var(--color-surface)] shadow-sm"
                      : "border-[var(--color-border)] bg-[var(--color-surface)]/70 hover:bg-[var(--color-surface)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[var(--color-text-main)]">{agent.name}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-muted)]">{agent.code}</div>
                    </div>
                    {active && (
                      <span className="rounded-full bg-[var(--color-primary)] px-2 py-1 text-[11px] font-semibold text-[var(--color-primary-contrast)]">
                        선택됨
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
