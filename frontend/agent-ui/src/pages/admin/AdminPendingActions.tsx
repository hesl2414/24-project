// ============================================
// src/pages/admin/AdminPendingActions.tsx
// ============================================
import { useCallback, useState } from "react";
import { useAsync } from "../../hooks/useAsync";
import Loading from "../../components/common/Loading";
import ErrorBox from "../../components/common/ErrorBox";
import SectionCard from "../../components/admin/SectionCard";
import AdminTable from "../../components/admin/AdminTable";
import StatusBadge from "../../components/admin/StatusBadge";
import SearchFilterBar from "../../components/admin/SearchFilterBar";
import { formatDateTime, shortenText } from "../../utils/format";
import "./AdminPendingActions.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

type PendingAction = {
  action_id:    string;
  agent_code:   string;
  intent_name:  string;
  action_type:  string;
  requested_by: string;
  requested_at: string;
  action_desc:  string;
  pk_check:     "OK" | "WARN" | "ERROR";
  pk_check_msg: string;
  status:       string;
  confirmed_by?: string;
  confirmed_at?: string;
  result_msg?:  string;
  site_code?:   string;
};

type ActionDetail = PendingAction & {
  exec_sql:    string;
  rollback_sql: string;
  bind_params: Record<string, string>;
};

async function apiFetchActions(status: string, siteCode: string) {
  const params = new URLSearchParams();
  if (status)   params.set("status", status);
  if (siteCode) params.set("site_code", siteCode);
  const res = await fetch(`${API_BASE}/api/admin/pending-actions?${params}`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return (data.items ?? []) as PendingAction[];
}

async function apiFetchDetail(actionId: string): Promise<ActionDetail> {
  const res = await fetch(`${API_BASE}/api/admin/pending-actions/${actionId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPost(
  actionId: string,
  op: "confirm" | "reject" | "rollback",
  body: Record<string, string>,
) {
  const res = await fetch(
    `${API_BASE}/api/admin/pending-actions/${actionId}/${op}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "오류 발생" }));
    throw new Error(err.detail ?? "오류 발생");
  }
  return res.json();
}

function PkBadge({ check, msg }: { check: string; msg: string }) {
  const icon = check === "OK" ? "✅" : check === "WARN" ? "⚠️" : "❌";
  return (
    <span className={`pk-badge pk-badge-${check.toLowerCase()}`} title={msg}>
      {icon} {check}
    </span>
  );
}

function SqlPreview({ label, sql }: { label: string; sql: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    void navigator.clipboard.writeText(sql).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <div className="sql-preview">
      <div className="sql-preview-header">
        <span className="sql-preview-label">{label}</span>
        <button type="button" className="sql-copy-btn" onClick={copy}>
          {copied ? "복사됨 ✓" : "복사"}
        </button>
      </div>
      <pre className="sql-preview-code"><code>{sql}</code></pre>
    </div>
  );
}

function DetailModal({
  actionId,
  adminUser,
  onClose,
  onDone,
}: {
  actionId:  string;
  adminUser: string;
  onClose:   () => void;
  onDone:    () => void;
}) {
  const fetchDetail = useCallback(() => apiFetchDetail(actionId), [actionId]);
  const { data: detail, loading, error } = useAsync(fetchDetail);

  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState("");
  const [rejectReason, setRejectReason] = useState("");

  async function handle(op: "confirm" | "reject" | "rollback") {
    setSubmitting(true);
    setSubmitError("");
    try {
      await apiPost(actionId, op, {
        confirmed_by: adminUser,
        ...(op === "reject" ? { reason: rejectReason } : {}),
      });
      onDone();
      onClose();
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "오류 발생");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h3>요청 상세</h3>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading && <Loading />}
          {error      && <ErrorBox message={error} />}
          {submitError && <ErrorBox message={submitError} />}

          {detail && (
            <>
              <div className="detail-grid">
                {([
                  ["요청 내용", detail.action_desc],
                  ["Action",    detail.action_type],
                  ["요청자",    detail.requested_by],
                  ["요청 시간", formatDateTime(detail.requested_at)],
                  ["Agent",     detail.agent_code],
                  ["Site",      detail.site_code || "-"],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="detail-item">
                    <span className="detail-label">{k}</span>
                    <span className="detail-value">{v}</span>
                  </div>
                ))}
              </div>

              <div className="detail-status-row">
                <StatusBadge status={detail.status as any} />
                <PkBadge check={detail.pk_check} msg={detail.pk_check_msg} />
                {detail.pk_check_msg && (
                  <span className="detail-pk-msg">{detail.pk_check_msg}</span>
                )}
              </div>

              {detail.bind_params && Object.keys(detail.bind_params).length > 0 && (
                <div className="detail-params">
                  <span className="detail-label">파라미터</span>
                  <div className="param-tags">
                    {Object.entries(detail.bind_params).map(([k, v]) => (
                      <span key={k} className="param-tag">
                        <span className="param-key">{k}:</span> {String(v)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <SqlPreview label="실행 쿼리"  sql={detail.exec_sql} />
              <SqlPreview label="원복 쿼리"  sql={detail.rollback_sql} />

              {detail.result_msg && (
                <div className="detail-item">
                  <span className="detail-label">처리 결과</span>
                  <span className="detail-value">{detail.result_msg}</span>
                </div>
              )}

              {detail.status === "PENDING" && (
                <input
                  className="reject-reason-input"
                  placeholder="거절 사유 입력 (선택)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              )}
            </>
          )}
        </div>

        {detail && (
          <div className="modal-footer">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={onClose}>닫기</button>
            {detail.status === "PENDING" && (
              <>
                <button
                  type="button"
                  className="modal-btn modal-btn-reject"
                  disabled={submitting}
                  onClick={() => void handle("reject")}
                >
                  거절
                </button>
                <button
                  type="button"
                  className="modal-btn modal-btn-confirm"
                  disabled={submitting || detail.pk_check === "ERROR"}
                  onClick={() => void handle("confirm")}
                >
                  {submitting ? "처리 중..." : "확인 및 실행"}
                </button>
              </>
            )}
            {detail.status === "DONE" && (
              <button
                type="button"
                className="modal-btn modal-btn-rollback"
                disabled={submitting}
                onClick={() => void handle("rollback")}
              >
                {submitting ? "원복 중..." : "원복"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPendingActions({
  adminUser = "admin",
}: {
  adminUser?: string;
}) {
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [siteFilter,   setSiteFilter]   = useState("");
  const [selectedId,   setSelectedId]   = useState<string | null>(null);

  const fetchActions = useCallback(
    () => apiFetchActions(statusFilter, siteFilter),
    [statusFilter, siteFilter],
  );
  const { data, loading, error, reload } = useAsync(fetchActions);
  const actions = data ?? [];

  if (loading) return <Loading />;
  if (error)   return <ErrorBox message={error} />;

  const statusOptions = [
    { value: "",            label: "전체"   },
    { value: "PENDING",     label: "대기"   },
    { value: "DONE",        label: "완료"   },
    { value: "REJECTED",    label: "거절"   },
    { value: "FAILED",      label: "실패"   },
    { value: "ROLLED_BACK", label: "원복됨" },
  ];

  const pendingCount = actions.filter((a) => a.status === "PENDING").length;

  return (
    <div className="pending-actions-page">
      <SearchFilterBar>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <input
          placeholder="Site (KR, CN...)"
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
        />
        <button type="button" onClick={reload}>새로고침</button>
      </SearchFilterBar>

      <SectionCard
        title={`Pending Actions (${actions.length}건)`}
        right={
          pendingCount > 0
            ? <span className="pending-count-badge">대기 {pendingCount}건</span>
            : null
        }
      >
        {actions.length === 0 ? (
          <div className="pending-empty">요청이 없습니다.</div>
        ) : (
          <AdminTable columns={["상태", "PK", "요청 내용", "Action", "요청자", "시간", "Site", "상세"]}>
            {actions.map((action) => (
              <tr key={action.action_id}>
                <td><StatusBadge status={action.status as any} /></td>
                <td><PkBadge check={action.pk_check} msg={action.pk_check_msg} /></td>
                <td>{shortenText(action.action_desc, 50)}</td>
                <td>{action.action_type}</td>
                <td>{action.requested_by}</td>
                <td>{formatDateTime(action.requested_at)}</td>
                <td>{action.site_code || "-"}</td>
                <td>
                  <button
                    type="button"
                    className="detail-link"
                    onClick={() => setSelectedId(action.action_id)}
                  >
                    보기
                  </button>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </SectionCard>

      {selectedId && (
        <DetailModal
          actionId={selectedId}
          adminUser={adminUser}
          onClose={() => setSelectedId(null)}
          onDone={reload}
        />
      )}
    </div>
  );
}
