// ============================================
// src/components/admin/MessageBubble.tsx
// ============================================
import type { ChatMessageItem } from "../../types/admin";
import { formatDateTime } from "../../utils/format";
import JsonViewer from "./JsonViewer";
import "./MessageBubble.css";

interface Props {
  message: ChatMessageItem;
}

export default function MessageBubble({ message }: Props) {
  return (
    <div className={`message-bubble role-${message.role}`}>
      <div className="message-bubble-header">
        <strong>{message.role}</strong>
        <span>#{message.seq_no}</span>
        <span>{formatDateTime(message.created_at)}</span>
      </div>

      <div className="message-bubble-content">{message.content}</div>

      {message.tool_name ? (
        <div className="message-tool-box">
          <div><strong>tool_name:</strong> {message.tool_name}</div>
          {message.tool_args ? <JsonViewer value={message.tool_args} title="tool_args" /> : null}
          {message.tool_result ? <JsonViewer value={message.tool_result} title="tool_result" /> : null}
        </div>
      ) : null}
    </div>
  );
}