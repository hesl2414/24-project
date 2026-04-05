import { useState } from "react";

type InputPanelProps = {
  message: any;
  onSubmitInput?: (payload: { input_key?: string; value: string }) => Promise<void> | void;
};

export default function InputPanel({ message, onSubmitInput }: InputPanelProps) {
  const [value, setValue] = useState("");

  const handleSubmit = async () => {
    await onSubmitInput?.({
      value,
      input_key: message.input_key,
    });

    setValue("");
  };

  return (
    <div className="border p-3 mt-2 rounded bg-yellow-50">
      <div className="font-bold mb-2">
        📝 추가 입력 필요
        {message.step && message.total_steps && (
          <span className="ml-2 text-sm text-gray-500">
            ({message.step}/{message.total_steps})
          </span>
        )}
      </div>

      {message.input_type === "select" && (
        <select
          className="border p-2 w-full"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          <option value="">선택하세요</option>
          {message.input_options?.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {message.input_type !== "select" && (
        <input
          className="border p-2 w-full"
          value={value}
          placeholder="값 입력..."
          onChange={(e) => setValue(e.target.value)}
        />
      )}

      <button
        className="bg-green-500 text-white px-3 py-1 mt-2 rounded"
        onClick={handleSubmit}
        disabled={!value}
      >
        입력
      </button>
    </div>
  );
}