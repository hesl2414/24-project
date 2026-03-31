// ============================================
// src/components/admin/RunTimeline.tsx
// ============================================
import type { RunStepItem } from "../../types/admin";
import { formatDateTime, formatDuration } from "../../utils/format";
import StatusBadge from "./StatusBadge";
import JsonViewer from "./JsonViewer";
import "./RunTimeline.css";

interface Props {
  steps: RunStepItem[];
}

export default function RunTimeline({ steps }: Props) {
  return (
    <div className="run-timeline">
      {steps.map((step) => (
        <div className="run-step" key={step.step_id}>
          <div className="run-step-left">
            <div className="run-step-order">{step.step_order}</div>
          </div>

          <div className="run-step-right">
            <div className="run-step-header">
              <div>
                <strong>{step.node_name}</strong>
                <span className="run-step-type">{step.step_type}</span>
              </div>
              <StatusBadge status={step.status} />
            </div>

            <div className="run-step-meta">
              <span>시작: {formatDateTime(step.started_at)}</span>
              <span>종료: {formatDateTime(step.ended_at)}</span>
              <span>소요: {formatDuration(step.duration_ms)}</span>
            </div>

            {step.error_message ? (
              <div className="run-step-error">{step.error_message}</div>
            ) : null}

            <div className="run-step-json-grid">
              {step.input_snapshot ? (
                <JsonViewer title="input_snapshot" value={step.input_snapshot} />
              ) : null}
              {step.output_snapshot ? (
                <JsonViewer title="output_snapshot" value={step.output_snapshot} />
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}