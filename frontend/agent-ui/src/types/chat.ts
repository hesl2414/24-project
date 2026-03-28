export type ChatSession = {
  chat_id: string;
  user_id: string;
  title: string;
  agent_code?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AgentInfo = {
  code: string;
  name: string;
  description: string;
};

export type ChatMessage = {
  message_id: string;
  chat_id: string;
  seq_no: number;
  role: string;
  content: string;
  agent_code?: string | null;
  tool_name?: string | null;
  tool_args?: string | null;
  tool_result?: string | null;
  created_at?: string;
};

export type ChatDetailResponse = {
  session: ChatSession;
  messages: ChatMessage[];
  run_logs?: unknown[];
};

export type AgentInvokeResponse = {
  chat_id: string;
  agent_code: string;
  user_message: string;
  assistant_message: string;
  used_tools: string[];
};

export type CreateChatRequest = {
  user_id: string;
  title?: string;
  agent_code?: string | null;
};

export type InvokeAgentRequest = {
  user_id: string;
  message: string;
  chat_id?: string | null;
};