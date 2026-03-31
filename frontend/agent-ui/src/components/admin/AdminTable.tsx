// ============================================
// src/components/admin/AdminTable.tsx
// ============================================
import "./AdminTable.css";

interface Props {
  columns: string[];
  children: React.ReactNode;
}

export default function AdminTable({ columns, children }: Props) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}