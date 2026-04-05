import { useState } from "react";
import { apiRequest } from "../../api/client";

export default function ActionPanel({ message }: any) {
  const [payload, setPayload] = useState(message.action_payload);

  const editableFields = message.action_schema?.editable_fields || [];

  const handleChange = (key: string, value: any) => {
    setPayload((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApprove = async () => {
    await apiRequest("/api/agents/action/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action_type: message.action_type,
        payload,
      }),
    });

    alert("실행 완료");
  };

  return (
    <div className="border p-3 mt-2 rounded bg-white">
      <h4 className="font-bold mb-2">⚙ 실행 요청</h4>

      {Object.entries(payload || {}).map(([key, value]) => (
        <div key={key} className="mb-2">
          <label className="text-sm text-gray-600">{key}</label>

          {editableFields.includes(key) ? (
            <input
              className="border p-1 w-full"
              value={value as any}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          ) : (
            <div className="text-gray-800">{String(value)}</div>
          )}
        </div>
      ))}

      <div className="flex gap-2 mt-2">
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={handleApprove}
        >
          승인
        </button>
        <button className="bg-gray-400 text-white px-3 py-1 rounded">
          취소
        </button>
      </div>
    </div>
  );
}