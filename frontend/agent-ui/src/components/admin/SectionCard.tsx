// ============================================
// src/components/admin/SectionCard.tsx
// ============================================
import "./SectionCard.css";

interface Props {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}

export default function SectionCard({ title, children, right }: Props) {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <h3>{title}</h3>
        {right}
      </div>
      <div className="section-card-body">{children}</div>
    </div>
  );
}