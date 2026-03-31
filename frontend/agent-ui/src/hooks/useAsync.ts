import { useCallback, useEffect, useRef, useState } from "react";

export function useAsync<T>(asyncFn: () => Promise<T>, immediate = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<string | null>(null);

  const hasExecutedRef = useRef(false);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFn]);

  useEffect(() => {
    if (!immediate) return;
    if (hasExecutedRef.current) return;

    hasExecutedRef.current = true;
    void execute();
  }, [immediate, execute]);

  return { data, loading, error, execute, setData };
}