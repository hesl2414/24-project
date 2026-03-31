// ============================================
// src/pages/admin/AgentListPage.tsx
// ============================================
import { useCallback } from "react";
import { adminApi } from "../../api/adminApi";
import { useAsync } from "../../hooks/useAsync";
import Loading from "../../components/common/Loading";
import ErrorBox from "../../components/common/ErrorBox";
import AdminTable from "../../components/admin/AdminTable";
import { formatDateTime } from "../../utils/format";

export default function AgentListPage() {
  const fetchAgents = useCallback(() => adminApi.getAgents(), []);
  const { data, loading, error } = useAsync(fetchAgents);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;

  return (
    <AdminTable
      columns={[
        "Agent Code",
        "Name",
        "Description",
        "Active",
        "Runs",
        "Success",
        "Error",
        "Last Called",
      ]}
    >
      {(data || []).map((agent) => (
        <tr key={agent.agent_code}>
          <td>{agent.agent_code}</td>
          <td>{agent.agent_name}</td>
          <td>{agent.description || "-"}</td>
          <td>{agent.is_active ? "Y" : "N"}</td>
          <td>{agent.run_count}</td>
          <td>{agent.success_count}</td>
          <td>{agent.error_count}</td>
          <td>{formatDateTime(agent.last_called_at)}</td>
        </tr>
      ))}
    </AdminTable>
  );
}