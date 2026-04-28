import { useState } from "react";

type InputOption = {
  label: string;
  value: string;
};

type ActionSchema = {
  editable_fields?: string[];
};

type SuggestedQuestion = {
  label:      string;
  query:      string;
  agent_code: string;
};

export type ChatMessagePayload = {
  assistant_message: string;

  action_required?: boolean;
  action_type?: string;
  action_payload?: Record<string, any>;
  action_schema?: ActionSchema;

  requires_input?: boolean;
  input_type?: "text" | "select" | "button";
  input_key?: string;
  input_options?: InputOption[];
  step?: number;
  total_steps?: number;

  step_trace?: any[];

  // 추천 질문
  suggested_questions?: SuggestedQuestion[];

  // 이미 처리 완료된 입력/액션 표시용
  submitted_value?: string;
  submitted_label?: string;
  interaction_closed?: boolean;
};

type ChatMessageProps = {
  message: ChatMessagePayload;
  interactive?: boolean;
  onSubmitInput?: (payload: { input_key?: string; value: string }) => Promise<void> | void;
  onApproveAction?: (payload: {
    action_type?: string;
    payload: Record<string, any>;
  }) => Promise<void> | void;
  onRejectAction?: () => Promise<void> | void;
  onSuggestedQuery?: (query: string, agentCode: string) => void;
};

// ── 추천 질문 버튼 ────────────────────────────────────────────
function SuggestedQuestions({
  questions,
  onSelect,
}: {
  questions: SuggestedQuestion[];
  onSelect: (query: string, agentCode: string) => void;
}) {
  if (!questions.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {questions.map((q, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(q.query, q.agent_code)}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          {q.label} →
        </button>
      ))}
    </div>
  );
}

// ── 즐겨찾기 버튼 ────────────────────────────────────────────
function BookmarkButton({ message }: { message: ChatMessagePayload }) {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    try {
      const raw = localStorage.getItem("fav_questions") || "[]";
      const list: Array<{ id: string; question: string; created_at: string }> = JSON.parse(raw);
      const text = message.assistant_message?.slice(0, 80) || "";
      if (!text) return;
      // 중복 체크
      if (list.some((f) => f.question === text)) { setSaved(true); return; }
      list.unshift({ id: Date.now().toString(), question: text, created_at: new Date().toISOString() });
      localStorage.setItem("fav_questions", JSON.stringify(list.slice(0, 20)));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      title="즐겨찾기 저장"
      className="ml-2 text-[var(--color-text-muted)] transition hover:text-yellow-400"
    >
      {saved ? "⭐" : "☆"}
    </button>
  );
}

function StepTrace({ trace }: { trace: any[] }) {
  return (
    <details className="mt-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-app-bg)]/70 px-4 py-3">
      <summary className="cursor-pointer text-xs font-medium text-[var(--color-text-muted)]">
        실행 과정 보기
      </summary>
      <pre className="mt-3 overflow-auto rounded-xl bg-[var(--color-surface)] p-3 text-[11px] leading-5 text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]">
        {JSON.stringify(trace, null, 2)}
      </pre>
    </details>
  );
}

// ── 입력 완료 후 표시 (말풍선 안에 남는 것) ──────────────────
function SubmittedInputView({ message }: { message: ChatMessagePayload }) {
  const displayValue = message.submitted_label || message.submitted_value || "-";

  return (
    <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-app-bg)]/50 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-[var(--color-text-main)]">
          입력 완료
        </div>
        {message.step && message.total_steps ? (
          <div className="rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]">
            {message.step}/{message.total_steps}
          </div>
        ) : null}
      </div>
      <div className="rounded-2xl bg-[var(--color-surface)] p-3 ring-1 ring-[var(--color-border)]">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          {message.input_key || "value"}
        </div>
        <div className="text-sm text-[var(--color-text-main)]">{displayValue}</div>
      </div>
    </div>
  );
}

// ── 입력 대기 중 표시 (말풍선 안: 안내 문구만, 실제 입력은 하단) ──
function PendingInputView({ message }: { message: ChatMessagePayload }) {
  return (
    <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-app-bg)]/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-[var(--color-text-muted)]">
          ↓ 아래 입력창에서 응답해주세요
        </div>
        {message.step && message.total_steps ? (
          <div className="rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]">
            {message.step}/{message.total_steps}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ── ActionCard (승인/거절 — 이건 말풍선 안에 유지) ───────────
function ActionCard({
  message,
  onApproveAction,
  onRejectAction,
  interactive,
}: {
  message: ChatMessagePayload;
  onApproveAction?: (payload: {
    action_type?: string;
    payload: Record<string, any>;
  }) => Promise<void> | void;
  onRejectAction?: () => Promise<void> | void;
  interactive: boolean;
}) {
  const [payload, setPayload] = useState<Record<string, any>>(message.action_payload || {});
  const editableFields = message.action_schema?.editable_fields || [];

  function handleChange(key: string, value: string) {
    if (!interactive) return;
    setPayload((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-app-bg)]/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-[var(--color-text-main)]">실행 요청</div>
          {message.action_type ? (
            <div className="mt-1 text-xs text-[var(--color-text-muted)]">
              action: {message.action_type}
            </div>
          ) : null}
        </div>
        <div className="rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]">
          Human in the loop
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(payload).map(([key, value]) => {
          const editable = interactive && editableFields.includes(key);
          return (
            <div key={key} className="rounded-2xl bg-[var(--color-surface)] p-3 ring-1 ring-[var(--color-border)]">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                {key}
              </div>
              {editable ? (
                <input
                  className="w-full rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-primary)]"
                  value={value == null ? "" : String(value)}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              ) : (
                <div className="whitespace-pre-wrap break-words text-sm text-[var(--color-text-main)]">
                  {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {interactive ? (
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => void onRejectAction?.()}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-main)] transition hover:bg-[var(--color-app-bg)]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => void onApproveAction?.({ action_type: message.action_type, payload })}
            className="rounded-2xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            승인
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-xs text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]">
          이미 처리된 요청입니다.
        </div>
      )}
    </div>
  );
}

export default function ChatMessage({
  message,
  interactive = false,
  onSubmitInput,
  onApproveAction,
  onRejectAction,
  onSuggestedQuery,
}: ChatMessageProps) {
  const inputClosed = !!message.interaction_closed || !interactive;

  return (
    <div>
      {/* 텍스트 메시지 + 즐겨찾기 버튼 */}
      <div className="flex items-start gap-1">
        <div className="flex-1 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--color-text-main)]">
          {message.assistant_message}
        </div>
        {message.assistant_message && !message.requires_input && (
          <BookmarkButton message={message} />
        )}
        </div>

      {/* requires_input: 완료 시 SubmittedView, 대기 중 PendingView (실제 입력은 하단 Composer) */}
      {message.requires_input ? (
        inputClosed ? (
          <SubmittedInputView message={message} />
        ) : (
          <PendingInputView message={message} />
        )
      ) : null}

      {/* action_required: 말풍선 안에 유지 */}
      {message.action_required ? (
        <ActionCard
          message={message}
          onApproveAction={onApproveAction}
          onRejectAction={onRejectAction}
          interactive={interactive}
        />
      ) : null}

      {/* 추천 질문 */}
      {onSuggestedQuery && message.suggested_questions?.length ? (
        <SuggestedQuestions
          questions={message.suggested_questions}
          onSelect={onSuggestedQuery}
        />
      ) : null}

      {message.step_trace?.length ? <StepTrace trace={message.step_trace} /> : null}
    </div>
  );
}
