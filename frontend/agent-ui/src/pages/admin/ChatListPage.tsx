// ============================================
// src/pages/admin/ChatListPage.tsx
// ============================================
import { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import SearchFilterBar from "../../components/admin/SearchFilterBar";
import AdminTable from "../../components/admin/AdminTable";
import StatusBadge from "../../components/admin/StatusBadge";
import Loading from "../../components/common/Loading";
import ErrorBox from "../../components/common/ErrorBox";
import type { ChatSessionItem } from "../../types/admin";
import { formatDateTime } from "../../utils/format";
import { Link } from "react-router-dom";

export default function ChatListPage() {
  const [items, setItems] = useState<ChatSessionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [keyword, setKeyword] = useState("");
  const [userId, setUserId] = useState("");
  const [agentCode, setAgentCode] = useState("");
  const [status, setStatus] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminApi.getChats({
        page: 1,
        size: 50,
        keyword,
        userId,
        agentCode,
        status,
      });
      setItems(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <div>
      <SearchFilterBar>
        <input
          placeholder="keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <input
          placeholder="user_id"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          placeholder="agent_code"
          value={agentCode}
          onChange={(e) => setAgentCode(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">all status</option>
          <option value="RUNNING">RUNNING</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="ERROR">ERROR</option>
        </select>
        <button onClick={() => void loadData()}>검색</button>
      </SearchFilterBar>

      {loading ? <Loading /> : null}
      {error ? <ErrorBox message={error} /> : null}

      {!loading && !error ? (
        <AdminTable
          columns={[
            "Updated At",
            "Chat ID",
            "Title",
            "User",
            "Agent",
            "Last Status",
            "Detail",
          ]}
        >
          {items.map((chat) => (
            <tr key={chat.chat_id}>
              <td>{formatDateTime(chat.updated_at)}</td>
              <td>{chat.chat_id}</td>
              <td>{chat.title}</td>
              <td>{chat.user_id}</td>
              <td>{chat.agent_code}</td>
              <td><StatusBadge status={chat.last_run_status} /></td>
              <td>
                <Link to={`/admin/chats/${chat.chat_id}`}>상세</Link>
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : null}
    </div>
  );
}