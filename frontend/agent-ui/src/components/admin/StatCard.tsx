// ============================================
// src/components/admin/StatCard.tsx
// ============================================
import "./StatCard.css";

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function StatCard({ title, value, subtitle }: Props) {
  return (
    <div className="stat-card">
      <div className="stat-card-title">{title}</div>
      <div className="stat-card-value">{value}</div>
      {subtitle ? <div className="stat-card-subtitle">{subtitle}</div> : null}
    </div>
  );
}