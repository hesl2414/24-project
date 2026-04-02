// ============================================
// src/types/admin.ts
// ============================================
export type RunStatus = "RUNNING" | "SUCCESS" | "ERROR";

export interface DashboardSummary {
  todayChats: number;
  todayRuns: number;
  todayErrors: number;
  activeAgents: number;
}

export interface ChatSessionItem {
  chat_id: string;
  user_id: string;
  title: string;
  agent_code: string;
  last_message_at: string | null;
  last_run_status: RunStatus | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageItem {
  message_id: string;
  chat_id: string;
  seq_no: number;
  role: "user" | "assistant" | "tool" | "system";
  content: string;
  tool_name?: string | null;
  tool_args?: unknown;
  tool_result?: unknown;
  created_at: string;
}

export interface ChatSessionDetail {
  chat_id: string;
  user_id: string;
  title: string;
  agent_code: string;
  summary_text?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RunLogItem {
  run_id: string;
  chat_id: string;
  user_id?: string | null;
  agent_code: string;
  status: RunStatus;
  user_message: string;
  assistant_message?: string | null;
  used_tools?: string[] | null;
  error_message?: string | null;
  model_name?: string | null;
  started_at: string;
  ended_at?: string | null;
  duration_ms?: number | null;
}

export interface RunLogDetail extends RunLogItem {
  raw_input?: unknown;
  raw_output?: unknown;
}

export interface RunStepItem {
  step_id: string;
  run_id: string;
  step_order: number;
  node_name: string;
  step_type: string;
  status: RunStatus;
  input_snapshot?: unknown;
  output_snapshot?: unknown;
  error_message?: string | null;
  started_at: string;
  ended_at?: string | null;
  duration_ms?: number | null;
}

export interface AgentStatItem {
  agent_code: string;
  agent_name: string;
  description?: string | null;
  is_active: boolean;
  run_count: number;
  error_count: number;
  success_count: number;
  last_called_at?: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}