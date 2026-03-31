// ============================================
// src/pages/admin/DashboardPage.tsx
// ============================================
import { useCallback, useMemo } from "react";
import { adminApi } from "../../api/adminApi";
import Loading from "../../components/common/Loading";
import ErrorBox from "../../components/common/ErrorBox";
import SectionCard from "../../components/admin/SectionCard";
import StatCard from "../../components/admin/StatCard";
import AdminTable from "../../components/admin/AdminTable";
import StatusBadge from "../../components/admin/StatusBadge";
import { useAsync } from "../../hooks/useAsync";
import { formatDateTime, shortenText } from "../../utils/format";
import { Link } from "react-router-dom";
import "./DashboardPage.css";

export default function DashboardPage() {
  const fetchSummary = useCallback(() => adminApi.getDashboardSummary(), []);
  const fetchRecentRuns = useCallback(() => adminApi.getRecentRuns(), []);
  const fetchRecentChats = useCallback(() => adminApi.getRecentChats(), []);

  const summaryQuery = useAsync(fetchSummary);
  const recentRunsQuery = useAsync(fetchRecentRuns);
  const recentChatsQuery = useAsync(fetchRecentChats);

  const loading =
    summaryQuery.loading || recentRunsQuery.loading || recentChatsQuery.loading;

  const error =
    summaryQuery.error || recentRunsQuery.error || recentChatsQuery.error;

  const summary = summaryQuery.data;
  const recentRuns = useMemo(() => recentRunsQuery.data || [], [recentRunsQuery.data]);
  const recentChats = useMemo(() => recentChatsQuery.data || [], [recentChatsQuery.data]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;

  return (
    <div className="dashboard-page">
      <div className="dashboard-stats">
        <StatCard title="Today Chats" value={summary?.todayChats || 0} />
        <StatCard title="Today Runs" value={summary?.todayRuns || 0} />
        <StatCard title="Today Errors" value={summary?.todayErrors || 0} />
        <StatCard title="Active Agents" value={summary?.activeAgents || 0} />
      </div>

      <div className="dashboard-grid">
        <SectionCard title="최근 실패/실행 로그">
          <AdminTable
            columns={["Started At", "Agent", "Status", "User Message", "Duration", "Detail"]}
          >
            {recentRuns.map((run) => (
              <tr key={run.run_id}>
                <td>{formatDateTime(run.started_at)}</td>
                <td>{run.agent_code}</td>
                <td><StatusBadge status={run.status} /></td>
                <td>{shortenText(run.user_message, 60)}</td>
                <td>{run.duration_ms ?? "-"}</td>
                <td>
                  <Link to={`/admin/runs/${run.run_id}`}>보기</Link>
                </td>
              </tr>
            ))}
          </AdminTable>
        </SectionCard>

        <SectionCard title="최근 채팅 세션">
          <AdminTable
            columns={["Updated At", "Title", "User", "Agent", "Status", "Detail"]}
          >
            {recentChats.map((chat) => (
              <tr key={chat.chat_id}>
                <td>{formatDateTime(chat.updated_at)}</td>
                <td>{chat.title}</td>
                <td>{chat.user_id}</td>
                <td>{chat.agent_code}</td>
                <td><StatusBadge status={chat.last_run_status} /></td>
                <td>
                  <Link to={`/admin/chats/${chat.chat_id}`}>보기</Link>
                </td>
              </tr>
            ))}
          </AdminTable>
        </SectionCard>
      </div>
    </div>
  );
}