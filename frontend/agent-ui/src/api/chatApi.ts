import { apiRequest } from "./client";
import type {
  ChatDetailResponse,
  ChatSession,
  CreateChatRequest,
} from "../types/chat";

export async function getUserChats(userId: string): Promise<ChatSession[]> {
  return apiRequest<ChatSession[]>(
    `/api/chats/user/${encodeURIComponent(userId)}`
  );
}

export async function getChatDetail(chatId: string): Promise<ChatDetailResponse> {
  return apiRequest<ChatDetailResponse>(`/api/chats/${chatId}`);
}

export async function createChat(payload: CreateChatRequest): Promise<ChatSession> {
  return apiRequest<ChatSession>("/api/chats", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}