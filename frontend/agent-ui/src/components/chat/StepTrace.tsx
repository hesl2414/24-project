export default function StepTrace({ trace }: any) {
  return (
    <details className="mt-2">
      <summary className="cursor-pointer text-sm text-gray-500">
        🔍 실행 과정 보기
      </summary>

      <pre className="bg-black text-green-400 p-2 text-xs mt-1 overflow-auto">
        {JSON.stringify(trace, null, 2)}
      </pre>
    </details>
  );
}