import { useState } from "react";

type InputOption = {
  label: string;
  value: string;
};

type ActionSchema = {
  editable_fields?: string[];
};

type ChatMessagePayload = {
  assistant_message: string;
  action_required?: boolean;
  action_type?: string;
  action_payload?: Record<string, any>;
  action_schema?: ActionSchema;

  requires_input?: boolean;
  input_type?: "text" | "select";
  input_key?: string;
  input_options?: InputOption[];
  step?: number;
  total_steps?: number;

  step_trace?: any[];
};

type ChatMessageProps = {
  message: ChatMessagePayload;
  onSubmitInput?: (payload: { input_key?: string; value: string }) => Promise<void> | void;
  onApproveAction?: (payload: {
    action_type?: string;
    payload: Record<string, any>;
  }) => Promise<void> | void;
  onRejectAction?: () => Promise<void> | void;
};

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

function InputCard({
  message,
  onSubmitInput,
}: {
  message: ChatMessagePayload;
  onSubmitInput?: (payload: { input_key?: string; value: string }) => Promise<void> | void;
}) {
  const [value, setValue] = useState("");

  const isSelect = message.input_type === "select";
  const canSubmit = value.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    await onSubmitInput?.({
      input_key: message.input_key,
      value,
    });
    setValue("");
  }

  return (
    <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-app-bg)]/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-[var(--color-text-main)]">
          추가 입력 필요
        </div>

        {message.step && message.total_steps ? (
          <div className="rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]">
            {message.step}/{message.total_steps}
          </div>
        ) : null}
      </div>

      {isSelect ? (
        <select
          className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-primary)]"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          <option value="">선택하세요</option>
          {message.input_options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
          value={value}
          placeholder="값 입력..."
          onChange={(e) => setValue(e.target.value)}
        />
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
          className="rounded-2xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          입력
        </button>
      </div>
    </div>
  );
}

function ActionCard({
  message,
  onApproveAction,
  onRejectAction,
}: {
  message: ChatMessagePayload;
  onApproveAction?: (payload: {
    action_type?: string;
    payload: Record<string, any>;
  }) => Promise<void> | void;
  onRejectAction?: () => Promise<void> | void;
}) {
  const [payload, setPayload] = useState<Record<string, any>>(message.action_payload || {});
  const editableFields = message.action_schema?.editable_fields || [];

  function handleChange(key: string, value: string) {
    setPayload((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleApprove() {
    await onApproveAction?.({
      action_type: message.action_type,
      payload,
    });
  }

  async function handleReject() {
    await onRejectAction?.();
  }

  return (
    <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-app-bg)]/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-[var(--color-text-main)]">
            실행 요청
          </div>
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
          const editable = editableFields.includes(key);

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

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => void handleReject()}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-main)] transition hover:bg-[var(--color-app-bg)]"
        >
          취소
        </button>
        <button
          type="button"
          onClick={() => void handleApprove()}
          className="rounded-2xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          승인
        </button>
      </div>
    </div>
  );
}

export default function ChatMessage({
  message,
  onSubmitInput,
  onApproveAction,
  onRejectAction,
}: ChatMessageProps) {
  return (
    <div>
      <div className="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--color-text-main)]">
        {message.assistant_message}
      </div>

      {message.requires_input ? (
        <InputCard message={message} onSubmitInput={onSubmitInput} />
      ) : null}

      {message.action_required ? (
        <ActionCard
          message={message}
          onApproveAction={onApproveAction}
          onRejectAction={onRejectAction}
        />
      ) : null}

      {message.step_trace?.length ? <StepTrace trace={message.step_trace} /> : null}
    </div>
  );
}