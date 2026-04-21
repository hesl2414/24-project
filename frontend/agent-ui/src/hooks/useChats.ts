import { useEffect, useMemo, useState } from "react";
import { createChat, getChatDetail, getUserChats } from "../api/chatApi";
import { invokeAgent } from "../api/agentApi";
import { useSitePreference } from "./useSitePreference";
import type { ChatDetailResponse, ChatSession } from "../types/chat";
import { apiRequest } from "../api/client";

type UseChatsParams = {
  selectedAgentCode: string | null;
  setSelectedAgentCode: (agentCode: string | null) => void;
};

export function useChats({
  selectedAgentCode,
  setSelectedAgentCode,
}: UseChatsParams) {
  const { site, setSite } = useSitePreference();
  const [userId, setUserId] = useState("user1");

  const [chats, setChats] = useState<ChatSession[]>([]);
  const [chatDetails, setChatDetails] = useState<Record<string, ChatDetailResponse>>({});
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [chatSearch, setChatSearch] = useState("");

  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedChat = useMemo(() => {
    return chats.find((chat) => chat.chat_id === selectedChatId) ?? null;
  }, [chats, selectedChatId]);

  const selectedChatDetail = useMemo(() => {
    if (!selectedChatId) return null;
    return chatDetails[selectedChatId] ?? null;
  }, [chatDetails, selectedChatId]);

  useEffect(() => {
    void loadChats(userId);
  }, [userId]);

  async function loadChatDetail(chatId: string, focus = true, updateAgent = false) {
    try {
      setError(null);
      const data = await getChatDetail(chatId);

      setChatDetails((prev) => ({
        ...prev,
        [chatId]: data,
      }));

      if (focus) {
        setSelectedChatId(chatId);
      }

      if (updateAgent && data.session.agent_code) {
        setSelectedAgentCode(data.session.agent_code);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat 상세 조회 실패");
      return null;
    }
  }

  async function loadChats(targetUserId: string) {
    try {
      setIsLoadingChats(true);
      setError(null);

      const data = await getUserChats(targetUserId);
      setChats(data);

      if (data.length === 0) {
        setSelectedChatId(null);
        return;
      }

      const nextChatId = data.some((chat) => chat.chat_id === selectedChatId)
        ? selectedChatId
        : data[0].chat_id;

      if (nextChatId) {
        setSelectedChatId(nextChatId);
        await loadChatDetail(nextChatId, true);
      }

      const missingChatIds = data
        .map((chat) => chat.chat_id)
        .filter((chatId) => !chatDetails[chatId])
        .slice(0, 8);

      await Promise.all(missingChatIds.map((chatId) => loadChatDetail(chatId, false)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat 목록 조회 실패");
    } finally {
      setIsLoadingChats(false);
    }
  }

  async function selectChat(chatId: string) {
    await loadChatDetail(chatId, true, true);
  }

  async function createNewChat() {
    try {
      setError(null);

      const created = await createChat({
        site_code: site,
        user_id: userId,
        title: "New Chat",
        agent_code: selectedAgentCode,
      });

      await loadChats(userId);
      await loadChatDetail(created.chat_id, true, true);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "새 채팅 생성 실패");
    }
  }

  async function sendMessage(pgmId?: string) {
    const trimmed = message.trim();
    if (!trimmed) return;

    if (!selectedAgentCode) {
      setError("먼저 agent를 선택하세요.");
      return;
    }

    try {
      setIsSending(true);
      setError(null);

      const result = await invokeAgent(selectedAgentCode, {
        user_id: userId,
        message: trimmed,
        chat_id: selectedChatId,
        site_code: site,
        pgm_id:   pgmId ?? null,
      });

      setMessage("");
      await loadChats(userId);
      await loadChatDetail(result.chat_id, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "메시지 전송 실패");
    } finally {
      setIsSending(false);
    }
  }

  async function submitStructuredInput(payload: {
    input_key?: string;
    value: string;
  }) {
    if (!selectedChatId) return;

    setError(null);
    setIsSending(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chats/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: selectedChatId,
          message: payload.value,
          input_key: payload.input_key,
          mode: "structured_input",
          agent_code: selectedAgentCode,
          site_code: site,
          user_id: userId,
        }),
      });

      console.log("[submitStructuredInput] status =", res.status);

      const text = await res.text();
      console.log("[submitStructuredInput] raw body =", text);

      if (!res.ok) {
        throw new Error(text || `추가 입력 전송 실패 (${res.status})`);
      }

      const data = JSON.parse(text);
      await loadChats(userId);
      await loadChatDetail(data.chat_id ?? selectedChatId, true);
    } catch (e: any) {
      console.error("[submitStructuredInput] error =", e);
      setError(e?.message || "추가 입력 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  }

  async function approveAgentAction(payload: {
    action_type?: string;
    payload: Record<string, any>;
  }) {
    if (!selectedChatId) return;

    setError(null);
    setIsSending(true);

    try {
      const res = await fetch("/api/agents/action/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: selectedChatId,
          agent_code: selectedAgentCode,
          action_type: payload.action_type,
          payload: payload.payload,
          site_code: site,
          user_id: userId,
        }),
      });

      if (!res.ok) {
        throw new Error("실행 승인에 실패했습니다.");
      }

      const data = await res.json();
      await loadChats(userId);
      await loadChatDetail(data.chat_id ?? selectedChatId, true);
    } catch (e: any) {
      setError(e?.message || "승인 실행 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  }

  async function rejectAgentAction() {
    if (!selectedChatId) return;

    try {
      setError(null);
      await loadChats(userId);
      await loadChatDetail(selectedChatId, true);
    } catch (e: any) {
      setError(e?.message || "요청 취소 처리 중 오류가 발생했습니다.");
    }
  }

  return {
    site,
    setSite,
    userId,
    setUserId,
    chats,
    chatDetails,
    selectedChatId,
    selectedChat,
    selectedChatDetail,
    message,
    setMessage,
    chatSearch,
    setChatSearch,
    isLoadingChats,
    isSending,
    error,
    setError,
    selectChat,
    createNewChat,
    sendMessage,
    submitStructuredInput,
    approveAgentAction,
    rejectAgentAction,
    reloadChats: () => loadChats(userId),
  };
}