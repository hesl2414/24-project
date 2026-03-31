// ============================================
// src/components/common/ErrorBox.tsx
// ============================================
import "./ErrorBox.css";

interface Props {
  message: string;
}

export default function ErrorBox({ message }: Props) {
  return <div className="error-box">{message}</div>;
}