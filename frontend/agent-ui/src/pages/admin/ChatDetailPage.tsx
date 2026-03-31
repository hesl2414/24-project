// ============================================
// src/pages/admin/ChatDetailPage.tsx
// ============================================
import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import { useAsync } from "../../hooks/useAsync";
import Loading from "../../components/common/Loading";
import ErrorBox from "../../components/common/ErrorBox";
import SectionCard from "../../components/admin/SectionCard";
import MessageBubble from "../../components/admin/MessageBubble";
import { formatDateTime } from "../../utils/format";
import "./ChatDetailPage.css";

export default function ChatDetailPage() {
  const { chatId = "" } = useParams();

  const fetchDetail = useCallback(() => adminApi.getChatDetail(chatId), [chatId]);
  const fetchMessages = useCallback(() => adminApi.getChatMessages(chatId), [chatId]);

  const detailQuery = useAsync(fetchDetail);
  const messagesQuery = useAsync(fetchMessages);

  const loading = detailQuery.loading || messagesQuery.loading;
  const error = detailQuery.error || messagesQuery.error;

  const detail = detailQuery.data;
  const messages = useMemo(() => messagesQuery.data || [], [messagesQuery.data]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!detail) return <ErrorBox message="Chat not found" />;

  return (
    <div className="chat-detail-page">
      <SectionCard title="채팅 세션 정보">
        <div className="detail-grid">
          <div><strong>chat_id:</strong> {detail.chat_id}</div>
          <div><strong>user_id:</strong> {detail.user_id}</div>
          <div><strong>title:</strong> {detail.title}</div>
          <div><strong>agent:</strong> {detail.agent_code}</div>
          <div><strong>created_at:</strong> {formatDateTime(detail.created_at)}</div>
          <div><strong>updated_at:</strong> {formatDateTime(detail.updated_at)}</div>
        </div>

        {detail.summary_text ? (
          <div className="summary-box">
            <strong>summary_text</strong>
            <div>{detail.summary_text}</div>
          </div>
        ) : null}
      </SectionCard>

      <SectionCard title="메시지 목록">
        <div className="message-list">
          {messages.map((message) => (
            <MessageBubble key={message.message_id} message={message} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}