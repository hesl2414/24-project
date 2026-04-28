import type {
  AgentStatItem,
  ChatMessageItem,
  ChatSessionDetail,
  ChatSessionItem,
  DashboardSummary,
  PaginatedResponse,
  RunLogDetail,
  RunLogItem,
  RunStepItem,
} from "../types/admin";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json();
}

export interface ChatListParams {
  page?: number;
  size?: number;
  userId?: string;
  agentCode?: string;
  status?: string;
  keyword?: string;
}

export interface RunListParams {
  page?: number;
  size?: number;
  agentCode?: string;
  status?: string;
  userId?: string;
  keyword?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const adminApi = {
  getDashboardSummary: () =>
    request<DashboardSummary>("/api/admin/dashboard/summary"),

  getRecentRuns: () =>
    request<RunLogItem[]>("/api/admin/dashboard/recent-runs"),

  getRecentChats: () =>
    request<ChatSessionItem[]>("/api/admin/dashboard/recent-chats"),

  getChats: (params: ChatListParams) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.size) searchParams.set("size", String(params.size));
    if (params.userId) searchParams.set("user_id", params.userId);
    if (params.agentCode) searchParams.set("agent_code", params.agentCode);
    if (params.status) searchParams.set("status", params.status);
    if (params.keyword) searchParams.set("keyword", params.keyword);

    return request<PaginatedResponse<ChatSessionItem>>(
      `/api/admin/chats?${searchParams.toString()}`
    );
  },

  getChatDetail: (chatId: string) =>
    request<ChatSessionDetail>(`/api/admin/chats/${chatId}`),

  getChatMessages: (chatId: string) =>
    request<ChatMessageItem[]>(`/api/admin/chats/${chatId}/messages`),

  getRuns: (params: RunListParams) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.size) searchParams.set("size", String(params.size));
    if (params.agentCode) searchParams.set("agent_code", params.agentCode);
    if (params.status) searchParams.set("status", params.status);
    if (params.userId) searchParams.set("user_id", params.userId);
    if (params.keyword) searchParams.set("keyword", params.keyword);
    if (params.dateFrom) searchParams.set("date_from", params.dateFrom);
    if (params.dateTo) searchParams.set("date_to", params.dateTo);

    return request<PaginatedResponse<RunLogItem>>(
      `/api/admin/runs?${searchParams.toString()}`
    );
  },

  getRunDetail: (runId: string) =>
    request<RunLogDetail>(`/api/admin/runs/${runId}`),

  getRunSteps: (runId: string) =>
    request<RunStepItem[]>(`/api/admin/runs/${runId}/steps`),

  getAgents: () => request<AgentStatItem[]>("/api/admin/agents"),
};