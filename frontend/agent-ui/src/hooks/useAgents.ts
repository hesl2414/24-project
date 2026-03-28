import { useEffect, useMemo, useState } from "react";
import { getAgents } from "../api/agentApi";
import type { AgentInfo } from "../types/chat";

export function useAgents() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [selectedAgentCode, setSelectedAgentCode] = useState<string | null>(null);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  const selectedAgent = useMemo(() => {
    return agents.find((agent) => agent.code === selectedAgentCode) ?? null;
  }, [agents, selectedAgentCode]);

  async function loadAgents() {
    try {
      setIsLoadingAgents(true);
      const data = await getAgents();
      setAgents(data);
      setSelectedAgentCode((prev) => prev ?? data[0]?.code ?? null);
    } finally {
      setIsLoadingAgents(false);
    }
  }

  useEffect(() => {
    void loadAgents();
  }, []);

  return {
    agents,
    selectedAgentCode,
    selectedAgent,
    isLoadingAgents,
    setSelectedAgentCode,
    reloadAgents: loadAgents,
  };
}