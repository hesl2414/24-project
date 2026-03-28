import { apiRequest } from "./client";
import type {
  AgentInfo,
  AgentInvokeResponse,
  InvokeAgentRequest,
} from "../types/chat";

export async function getAgents(): Promise<AgentInfo[]> {
  return apiRequest<AgentInfo[]>("/agents");
}

export async function invokeAgent(
  agentCode: string,
  payload: InvokeAgentRequest
): Promise<AgentInvokeResponse> {
  return apiRequest<AgentInvokeResponse>(`/agents/${agentCode}/invoke`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}