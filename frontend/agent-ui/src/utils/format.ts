// ============================================
// src/utils/format.ts
// ============================================
export function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function formatDuration(ms?: number | null) {
  if (ms == null) return "-";
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)} sec`;
  return `${(ms / 60000).toFixed(1)} min`;
}

export function shortenText(text?: string | null, max = 80) {
  if (!text) return "-";
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

export function safeJsonStringify(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}