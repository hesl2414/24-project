import { useEffect, useState } from "react";

type RecentError = {
  req_no:     string;
  eqp_id:     string;
  site:       string;
  status:     string;
  days_ago:   string;
  summary:    string;
  pgm_id:     string;
  agent_code: string;
};

type FaqItem = {
  id:         number;
  question:   string;
  agent_code: string;
  auto_query: string;
};

type ManualItem = {
  id:       number;
  subject:  string;
  question: string;
  sr_type:  string;
};

type WelcomeData = {
  recent_errors: RecentError[];
  faq:           FaqItem[];
  manuals:       ManualItem[];
  has_data:      boolean;
};

type Props = {
  siteCode:    string | null;
  onQuery:     (query: string, agentCode?: string, pgmId?: string) => void;
};

// 다른 API들과 동일하게 VITE_API_BASE_URL 사용
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// localStorage 즐겨찾기 읽기
function loadFavorites(): Array<{ id: string; question: string; created_at: string }> {
  try {
    return JSON.parse(localStorage.getItem("fav_questions") || "[]");
  } catch { return []; }
}

function removeFavorite(id: string) {
  try {
    const list = loadFavorites().filter((f) => f.id !== id);
    localStorage.setItem("fav_questions", JSON.stringify(list));
  } catch {}
}

export default function WelcomeMessage({ siteCode, onQuery }: Props) {
  const [data, setData]       = useState<WelcomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => loadFavorites());

  function handleRemoveFav(id: string) {
    removeFavorite(id);
    setFavorites(loadFavorites());
  }

  useEffect(() => {
    const params = siteCode ? `?site_code=${siteCode}` : "";
    fetch(`${API_BASE}/welcome${params}`)
      .then((r) => r.json())
      .then((d: WelcomeData) => setData(d))
      .catch(() => setData(null))   // 에러 나도 조용히 null 처리
      .finally(() => setLoading(false));
  }, [siteCode]);

  // 로딩 중이거나 데이터 없으면 렌더링 안 함
  if (loading || !data || (!data.has_data && !favorites.length)) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-2 py-4">

      {/* 인사말 */}
      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 shadow-sm">
        <p className="text-base font-semibold text-[var(--color-text-main)]">
          💬 안녕하세요 👋
        </p>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          아래 항목을 눌러 바로 확인해보세요.
        </p>
      </div>

      {/* 미해결 문제 */}
      {data.recent_errors.length > 0 && (
        <section>
          <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            🔥 미해결 문제 (최근 7일)
          </h3>
          <div className="space-y-2">
            {data.recent_errors.map((err) => (
              <button
                key={err.req_no}
                type="button"
                onClick={() =>
                  onQuery(
                    `${err.req_no} 에러 확인해줘`,
                    err.agent_code,
                    err.pgm_id,
                  )
                }
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-left transition hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-text-main)]">
                    ❌ {err.eqp_id ? `${err.eqp_id} · ` : ""}{err.req_no}
                    {err.site ? ` · ${err.site}` : ""}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {err.days_ago}
                  </span>
                </div>
                {err.summary && (
                  <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
                    {err.summary}
                  </p>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 즐겨찾기 */}
      {favorites.length > 0 && (
        <section>
          <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            ⭐ 즐겨찾기
          </h3>
          <div className="flex flex-wrap gap-2">
            {favorites.map((fav) => (
              <div key={fav.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onQuery(fav.question)}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-main)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-app-bg)]"
                >
                  {fav.question.length > 30 ? fav.question.slice(0, 30) + "..." : fav.question}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveFav(fav.id)}
                  className="text-xs text-[var(--color-text-muted)] hover:text-red-400"
                  title="삭제"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 많이 찾는 질문 */}
      {data.faq.length > 0 && (
        <section>
          <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            💬 많이 찾는 질문
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.faq.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onQuery(item.auto_query, item.agent_code)}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-main)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-app-bg)]"
              >
                {item.question}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 메뉴얼 */}
      {data.manuals.length > 0 && (
        <section>
          <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            📋 메뉴얼
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.manuals.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onQuery(item.question, "rag")}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-main)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-app-bg)]"
              >
                {item.subject}
              </button>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
