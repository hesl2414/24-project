// ============================================
// src/components/admin/SearchFilterBar.tsx
// ============================================
import "./SearchFilterBar.css";

interface Props {
  children: React.ReactNode;
}

export default function SearchFilterBar({ children }: Props) {
  return <div className="search-filter-bar">{children}</div>;
}