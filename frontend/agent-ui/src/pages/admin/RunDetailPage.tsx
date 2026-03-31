// ============================================
// src/pages/admin/RunDetailPage.tsx
// ============================================
import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import { useAsync } from "../../hooks/useAsync";
import Loading from "../../components/common/Loading";
import ErrorBox from "../../components/common/ErrorBox";
import SectionCard from "../../components/admin/SectionCard";
import StatusBadge from "../../components/admin/StatusBadge";
import JsonViewer from "../../components/admin/JsonViewer";
import RunTimeline from "../../components/admin/RunTimeline";
import { formatDateTime, formatDuration } from "../../utils/format";
import "./RunDetailPage.css";

export default function RunDetailPage() {
  const { runId = "" } = useParams();

  const fetchDetail = useCallback(() => adminApi.getRunDetail(runId), [runId]);
  const fetchSteps = useCallback(() => adminApi.getRunSteps(runId), [runId]);

  const detailQuery = useAsync(fetchDetail);
  const stepsQuery = useAsync(fetchSteps);

  const loading = detailQuery.loading || stepsQuery.loading;
  const error = detailQuery.error || stepsQuery.error;

  const detail = detailQuery.data;
  const steps = useMemo(() => stepsQuery.data || [], [stepsQuery.data]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!detail) return <ErrorBox message="Run not found" />;

  return (
    <div className="run-detail-page">
      <SectionCard title="실행 기본 정보">
        <div className="detail-grid">
          <div><strong>run_id:</strong> {detail.run_id}</div>
          <div><strong>chat_id:</strong> {detail.chat_id}</div>
          <div><strong>agent_code:</strong> {detail.agent_code}</div>
          <div><strong>status:</strong> <StatusBadge status={detail.status} /></div>
          <div><strong>model_name:</strong> {detail.model_name || "-"}</div>
          <div><strong>duration:</strong> {formatDuration(detail.duration_ms)}</div>
          <div><strong>started_at:</strong> {formatDateTime(detail.started_at)}</div>
          <div><strong>ended_at:</strong> {formatDateTime(detail.ended_at)}</div>
        </div>

        <div className="run-message-block">
          <strong>user_message</strong>
          <div>{detail.user_message}</div>
        </div>

        <div className="run-message-block">
          <strong>assistant_message</strong>
          <div>{detail.assistant_message || "-"}</div>
        </div>

        {detail.used_tools?.length ? (
          <div className="run-message-block">
            <strong>used_tools</strong>
            <div>{detail.used_tools.join(", ")}</div>
          </div>
        ) : null}

        {detail.error_message ? (
          <div className="run-error-block">
            <strong>error_message</strong>
            <div>{detail.error_message}</div>
          </div>
        ) : null}
      </SectionCard>

      <SectionCard title="실행 Step Trace">
        <RunTimeline steps={steps} />
      </SectionCard>

      <div className="run-json-grid">
        {detail.raw_input ? <JsonViewer title="raw_input" value={detail.raw_input} /> : null}
        {detail.raw_output ? <JsonViewer title="raw_output" value={detail.raw_output} /> : null}
      </div>
    </div>
  );
}