// ============================================
// src/components/admin/StatusBadge.tsx
// ============================================
import type { RunStatus } from "../../types/admin";
import "./StatusBadge.css";

interface Props {
  status?: RunStatus | null;
}

export default function StatusBadge({ status }: Props) {
  const value = status || "-";
  const className = `status-badge status-${String(status || "default").toLowerCase()}`;
  return <span className={className}>{value}</span>;
}