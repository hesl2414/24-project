// ============================================
// src/components/admin/JsonViewer.tsx
// ============================================
import { safeJsonStringify } from "../../utils/format";
import "./JsonViewer.css";

interface Props {
  value: unknown;
  title?: string;
}

export default function JsonViewer({ value, title }: Props) {
  return (
    <div className="json-viewer">
      {title ? <div className="json-viewer-title">{title}</div> : null}
      <pre>{safeJsonStringify(value)}</pre>
    </div>
  );
}