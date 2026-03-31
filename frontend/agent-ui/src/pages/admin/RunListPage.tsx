// ============================================
// src/pages/admin/RunListPage.tsx
// ============================================
import { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import SearchFilterBar from "../../components/admin/SearchFilterBar";
import AdminTable from "../../components/admin/AdminTable";
import StatusBadge from "../../components/admin/StatusBadge";
import Loading from "../../components/common/Loading";
import ErrorBox from "../../components/common/ErrorBox";
import type { RunLogItem } from "../../types/admin";
import { formatDateTime, shortenText, formatDuration } from "../../utils/format";
import { Link } from "react-router-dom";

export default function RunListPage() {
  const [items, setItems] = useState<RunLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [keyword, setKeyword] = useState("");
  const [userId, setUserId] = useState("");
  const [agentCode, setAgentCode] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminApi.getRuns({
        page: 1,
        size: 50,
        keyword,
        userId,
        agentCode,
        status,
        dateFrom,
        dateTo,
      });
      setItems(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load runs");
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
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        <button onClick={() => void loadData()}>검색</button>
      </SearchFilterBar>

      {loading ? <Loading /> : null}
      {error ? <ErrorBox message={error} /> : null}

      {!loading && !error ? (
        <AdminTable
          columns={[
            "Started At",
            "Run ID",
            "Agent",
            "Status",
            "User Message",
            "Duration",
            "Detail",
          ]}
        >
          {items.map((run) => (
            <tr key={run.run_id}>
              <td>{formatDateTime(run.started_at)}</td>
              <td>{run.run_id}</td>
              <td>{run.agent_code}</td>
              <td><StatusBadge status={run.status} /></td>
              <td>{shortenText(run.user_message, 70)}</td>
              <td>{formatDuration(run.duration_ms)}</td>
              <td>
                <Link to={`/admin/runs/${run.run_id}`}>상세</Link>
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : null}
    </div>
  );
}