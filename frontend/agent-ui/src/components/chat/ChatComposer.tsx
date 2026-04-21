import { useState } from "react";

type InputOption = {
  label: string;
  value: string;
};

type InputField = {
  key:         string;
  type:        "text" | "menu_select";
  label:       string;
  options?:    InputOption[];
  placeholder?: string;
};

type PendingInput = {
  input_type?:   "text" | "select" | "button" | "menu_select" | "multi_input";
  input_key?:    string;
  input_options?: InputOption[];
  input_fields?:  InputField[];   // multi_input 전용
  assistant_message?: string;
};

type ChatComposerProps = {
  site: string;
  agentName: string;
  chatTitle?: string;
  selectedAgentCode: string | null;
  selectedChatId: string | null;
  message: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isSending: boolean;
  // HITL 상태 (마지막 메시지가 requires_input=true일 때 주입)
  pendingInput?: PendingInput | null;
  onSubmitInput?: (payload: { input_key?: string; value: string }) => Promise<void> | void;
};

// ── 텍스트 입력 ───────────────────────────────────────────────
function TextInputComposer({
  pendingInput,
  isSending,
  onSubmitInput,
}: {
  pendingInput: PendingInput;
  isSending: boolean;
  onSubmitInput: (payload: { input_key?: string; value: string }) => Promise<void> | void;
}) {
  const [value, setValue] = useState("");

  async function handleSubmit() {
    if (!value.trim()) return;
    await onSubmitInput({ input_key: pendingInput.input_key, value: value.trim() });
    setValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <div className="rounded-[28px] border border-[var(--color-primary)] bg-[var(--color-surface)] p-3 shadow-lg shadow-[var(--color-shadow-soft)]">
      <div className="mb-2 px-3 text-xs font-medium text-[var(--color-primary)]">
        📝 {pendingInput.input_key ?? "입력"} 값을 입력해주세요
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        placeholder="값 입력... (Enter로 전송)"
        className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-7 text-[var(--color-text-main)] outline-none placeholder:text-[var(--color-text-subtle)]"
        autoFocus
      />
      <div className="mt-2 flex items-center justify-end gap-3 px-2 pb-1">
        <button
          onClick={() => void handleSubmit()}
          disabled={isSending || !value.trim()}
          className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-contrast)] transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSending ? "전송 중" : "전송"}
        </button>
      </div>
    </div>
  );
}

// ── select 드롭다운 입력 ──────────────────────────────────────
function SelectInputComposer({
  pendingInput,
  isSending,
  onSubmitInput,
}: {
  pendingInput: PendingInput;
  isSending: boolean;
  onSubmitInput: (payload: { input_key?: string; value: string }) => Promise<void> | void;
}) {
  const [value, setValue] = useState("");

  async function handleSubmit() {
    if (!value) return;
    await onSubmitInput({ input_key: pendingInput.input_key, value });
    setValue("");
  }

  return (
    <div className="rounded-[28px] border border-[var(--color-primary)] bg-[var(--color-surface)] p-4 shadow-lg shadow-[var(--color-shadow-soft)]">
      <div className="mb-3 text-xs font-medium text-[var(--color-primary)]">
        📋 {pendingInput.input_key ?? "항목"} 선택
      </div>
      <select
        className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-primary)]"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        <option value="">선택하세요</option>
        {pendingInput.input_options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="mt-3 flex justify-end">
        <button
          onClick={() => void handleSubmit()}
          disabled={isSending || !value}
          className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-contrast)] transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSending ? "전송 중" : "선택"}
        </button>
      </div>
    </div>
  );
}

// ── 복수 파라미터 동시 입력 ────────────────────────────────────
function MultiInputComposer({
  pendingInput,
  isSending,
  onSubmitInput,
}: {
  pendingInput: PendingInput;
  isSending: boolean;
  onSubmitInput: (payload: { input_key?: string; value: string }) => Promise<void> | void;
}) {
  const fields = pendingInput.input_fields ?? [];
  const [values, setValues] = useState<Record<string, string>>({});
  // menu_select 필드별 페이지 상태
  const [menuPages, setMenuPages] = useState<Record<string, number>>({});

  function setValue(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit() {
    if (isSending) return;
    // 빈 값 허용 — 사용자가 채운 것만 전송
    const payload = JSON.stringify(values);
    await onSubmitInput({ value: payload });
    setValues({});
  }

  const allFilled = fields.every((f) => values[f.key]?.trim());

  return (
    <div className="rounded-[28px] border border-[var(--color-primary)] bg-[var(--color-surface)] p-4 shadow-lg space-y-3">
      <div className="text-xs font-medium text-[var(--color-primary)]">
        ✏️ 확인이 필요한 정보를 입력해주세요
      </div>

      {fields.map((field) => {
        if (field.type === "menu_select" && field.options?.length) {
          const page    = menuPages[field.key] ?? 0;
          const total   = Math.ceil(field.options.length / MENU_PAGE_SIZE);
          const items   = field.options.slice(page * MENU_PAGE_SIZE, (page + 1) * MENU_PAGE_SIZE);
          return (
            <div key={field.key} className="space-y-1.5">
              <div className="text-xs text-[var(--color-text-muted)]">{field.label}</div>
              {/* 선택된 값 표시 */}
              {values[field.key] && (
                <div className="flex items-center gap-1.5">
                  <span className="rounded-xl bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs text-[var(--color-primary)]">
                    ✓ {values[field.key]}
                  </span>
                  <button type="button" onClick={() => setValue(field.key, "")}
                    className="text-xs text-[var(--color-text-muted)] hover:text-red-500">
                    ✕
                  </button>
                </div>
              )}
              {/* 메뉴 버튼 목록 */}
              {!values[field.key] && (
                <>
                  <div className="space-y-1.5">
                    {items.map((opt) => (
                      <button key={opt.value} type="button" disabled={isSending}
                        onClick={() => setValue(field.key, opt.value)}
                        className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-left text-sm font-medium text-[var(--color-text-main)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-app-bg)] disabled:opacity-50">
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {/* 직접 입력 */}
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
                      placeholder={field.placeholder ?? "직접 입력..."}
                      onKeyDown={(e) => { if (e.key === "Enter") { setValue(field.key, e.currentTarget.value); e.currentTarget.value = ""; }}}
                      disabled={isSending}
                    />
                  </div>
                  {/* 페이지 네비 */}
                  {total > 1 && (
                    <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                      <button type="button" onClick={() => setMenuPages((p) => ({ ...p, [field.key]: Math.max(0, (p[field.key] ?? 0) - 1) }))}
                        disabled={(menuPages[field.key] ?? 0) === 0}
                        className="rounded-xl px-2 py-1 ring-1 ring-[var(--color-border)] transition hover:bg-[var(--color-app-bg)] disabled:opacity-30">
                        ← 이전
                      </button>
                      <span>{(menuPages[field.key] ?? 0) + 1} / {total}</span>
                      <button type="button" onClick={() => setMenuPages((p) => ({ ...p, [field.key]: Math.min(total - 1, (p[field.key] ?? 0) + 1) }))}
                        disabled={(menuPages[field.key] ?? 0) >= total - 1}
                        className="rounded-xl px-2 py-1 ring-1 ring-[var(--color-border)] transition hover:bg-[var(--color-app-bg)] disabled:opacity-30">
                        다음 →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        }

        // text 타입
        return (
          <div key={field.key} className="space-y-1">
            <div className="text-xs text-[var(--color-text-muted)]">{field.label}</div>
            <input
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
              value={values[field.key] ?? ""}
              placeholder={field.placeholder ?? ""}
              onChange={(e) => setValue(field.key, e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && allFilled) { e.preventDefault(); void handleSubmit(); }}}
              disabled={isSending}
            />
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={isSending || !allFilled}
        className="w-full rounded-2xl bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-[var(--color-primary-contrast)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        확인
      </button>
    </div>
  );
}

// ── 메뉴 선택 + 직접 입력 ──────────────────────────────────────
// 3개씩 페이징 + 4번째 칸에 직접 입력
const MENU_PAGE_SIZE = 3;

function MenuSelectComposer({
  pendingInput,
  isSending,
  onSubmitInput,
}: {
  pendingInput: PendingInput;
  isSending: boolean;
  onSubmitInput: (payload: { input_key?: string; value: string }) => Promise<void> | void;
}) {
  const [page, setPage] = useState(0);
  const [customValue, setCustomValue] = useState("");

  const options = pendingInput.input_options ?? [];
  const totalPages = Math.ceil(options.length / MENU_PAGE_SIZE);
  const pageItems = options.slice(page * MENU_PAGE_SIZE, (page + 1) * MENU_PAGE_SIZE);

  async function handleSelect(value: string) {
    if (isSending) return;
    await onSubmitInput({ input_key: pendingInput.input_key, value });
  }

  async function handleCustomSubmit() {
    if (!customValue.trim() || isSending) return;
    await onSubmitInput({ input_key: pendingInput.input_key, value: customValue.trim() });
    setCustomValue("");
  }

  function handleCustomKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleCustomSubmit();
    }
  }

  return (
    <div className="rounded-[28px] border border-[var(--color-primary)] bg-[var(--color-surface)] p-4 shadow-lg shadow-[var(--color-shadow-soft)]">
      <div className="mb-3 text-xs font-medium text-[var(--color-primary)]">
        📋 메뉴를 선택하거나 직접 입력하세요
      </div>

      {/* 메뉴 버튼 목록 (3개) */}
      <div className="space-y-2 mb-3">
        {pageItems.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={isSending}
            onClick={() => void handleSelect(opt.value)}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-left text-sm font-medium text-[var(--color-text-main)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-app-bg)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 직접 입력 */}
      <div className="flex gap-2 mb-3">
        <input
          className="flex-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
          value={customValue}
          placeholder="직접 입력..."
          onChange={(e) => setCustomValue(e.target.value)}
          onKeyDown={handleCustomKeyDown}
          disabled={isSending}
        />
        <button
          type="button"
          onClick={() => void handleCustomSubmit()}
          disabled={isSending || !customValue.trim()}
          className="rounded-2xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary-contrast)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          검색
        </button>
      </div>

      {/* 페이지 네비게이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-xl px-3 py-1.5 ring-1 ring-[var(--color-border)] transition hover:bg-[var(--color-app-bg)] disabled:opacity-30"
          >
            ← 이전
          </button>
          <span>{page + 1} / {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="rounded-xl px-3 py-1.5 ring-1 ring-[var(--color-border)] transition hover:bg-[var(--color-app-bg)] disabled:opacity-30"
          >
            다음 →
          </button>
        </div>
      )}
    </div>
  );
}

// ── button 카드 선택 ──────────────────────────────────────────
function ButtonInputComposer({
  pendingInput,
  isSending,
  onSubmitInput,
}: {
  pendingInput: PendingInput;
  isSending: boolean;
  onSubmitInput: (payload: { input_key?: string; value: string }) => Promise<void> | void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  async function handleSelect(value: string) {
    if (isSending) return;
    setSelected(value);
    await onSubmitInput({ input_key: pendingInput.input_key, value });
  }

  return (
    <div className="rounded-[28px] border border-[var(--color-primary)] bg-[var(--color-surface)] p-4 shadow-lg shadow-[var(--color-shadow-soft)]">
      <div className="mb-3 text-xs font-medium text-[var(--color-primary)]">
        👇 선택해주세요
      </div>
      <div className="flex flex-wrap gap-2">
        {pendingInput.input_options?.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={isSending}
            onClick={() => void handleSelect(opt.value)}
            className={`
              rounded-2xl border px-4 py-2.5 text-sm font-medium transition
              ${selected === opt.value
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-contrast)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] hover:border-[var(--color-primary)] hover:bg-[var(--color-app-bg)]"
              }
              disabled:cursor-not-allowed disabled:opacity-50
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── 일반 메시지 입력 ─────────────────────────────────────────
function DefaultComposer({
  site,
  agentName,
  chatTitle,
  selectedAgentCode,
  selectedChatId,
  message,
  onMessageChange,
  onSend,
  onKeyDown,
  isSending,
}: Omit<ChatComposerProps, "pendingInput" | "onSubmitInput">) {
  return (
    <div className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-lg shadow-[var(--color-shadow-soft)]">
      <textarea
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        onKeyDown={onKeyDown}
        rows={3}
        placeholder={
          selectedAgentCode
            ? "메시지를 입력하세요. Enter로 전송, Shift+Enter로 줄바꿈"
            : "오른쪽에서 agent를 먼저 선택하세요"
        }
        className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-7 text-[var(--color-text-main)] outline-none placeholder:text-[var(--color-text-subtle)]"
      />
      <div className="mt-2 flex items-center justify-between gap-3 px-2 pb-1">
        <div className="text-xs text-[var(--color-text-subtle)]">
          {selectedChatId ? "기존 채팅에 이어서 대화합니다" : "전송 시 새 채팅이 생성될 수 있습니다"}
        </div>
        <button
          onClick={onSend}
          disabled={isSending || !selectedAgentCode || !message.trim()}
          className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-contrast)] transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSending ? "전송 중" : "전송"}
        </button>
      </div>
    </div>
  );
}

// ── 메인 ChatComposer ─────────────────────────────────────────
export default function ChatComposer({
  site,
  agentName,
  chatTitle,
  selectedAgentCode,
  selectedChatId,
  message,
  onMessageChange,
  onSend,
  onKeyDown,
  isSending,
  pendingInput,
  onSubmitInput,
}: ChatComposerProps) {
  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 px-4 py-4 backdrop-blur md:px-6">
      <div className="mx-auto max-w-4xl">
        {/* 상단 칩: site / agent / chat */}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span className="rounded-full bg-[var(--color-chip-bg)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">
            Site: {site}
          </span>
          <span className="rounded-full bg-[var(--color-chip-bg)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">
            Agent: {agentName}
          </span>
          {chatTitle && (
            <span className="rounded-full bg-[var(--color-chip-bg)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">
              Chat: {chatTitle}
            </span>
          )}
          {/* HITL 진행 중 표시 */}
          {pendingInput && (
            <span className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1.5 text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/30">
              ✏️ 추가 입력 필요
            </span>
          )}
        </div>

        {/* 입력 영역: pendingInput 유무 + 타입에 따라 전환 */}
        {pendingInput && onSubmitInput ? (
          pendingInput.input_type === "multi_input" ? (
            <MultiInputComposer
              pendingInput={pendingInput}
              isSending={isSending}
              onSubmitInput={onSubmitInput}
            />
          ) : pendingInput.input_type === "menu_select" ? (
            <MenuSelectComposer
              pendingInput={pendingInput}
              isSending={isSending}
              onSubmitInput={onSubmitInput}
            />
          ) : pendingInput.input_type === "button" ? (
            <ButtonInputComposer
              pendingInput={pendingInput}
              isSending={isSending}
              onSubmitInput={onSubmitInput}
            />
          ) : pendingInput.input_type === "select" ? (
            <SelectInputComposer
              pendingInput={pendingInput}
              isSending={isSending}
              onSubmitInput={onSubmitInput}
            />
          ) : (
            <TextInputComposer
              pendingInput={pendingInput}
              isSending={isSending}
              onSubmitInput={onSubmitInput}
            />
          )
        ) : (
          <DefaultComposer
            site={site}
            agentName={agentName}
            chatTitle={chatTitle}
            selectedAgentCode={selectedAgentCode}
            selectedChatId={selectedChatId}
            message={message}
            onMessageChange={onMessageChange}
            onSend={onSend}
            onKeyDown={onKeyDown}
            isSending={isSending}
          />
        )}
      </div>
    </div>
  );
}
