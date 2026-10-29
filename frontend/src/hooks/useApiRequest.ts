"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError, isAbortError } from "../services/api";

export interface UseApiRequestResult<TArgs extends unknown[], TData> {
  data: TData | null;
  error: ApiError | null;
  loading: boolean;
  execute: (...args: TArgs) => Promise<TData | undefined>;
  reset: () => void;
}

export function useApiRequest<TArgs extends unknown[], TData>(
  request: (...args: TArgs) => Promise<TData>,
): UseApiRequestResult<TArgs, TData> {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: TArgs): Promise<TData | undefined> => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setLoading(true);
      setError(null);

      try {
        const result = await request(...args);

        if (mountedRef.current && requestIdRef.current === requestId) {
          setData(result);
          setLoading(false);
        }

        return result;
      } catch (caught) {
        if (isAbortError(caught)) {
          if (mountedRef.current && requestIdRef.current === requestId) {
            setLoading(false);
          }

          return undefined;
        }

        const apiError =
          caught instanceof ApiError
            ? caught
            : new ApiError("Something went wrong while contacting the API.", {
                cause: caught,
              });

        if (mountedRef.current && requestIdRef.current === requestId) {
          setError(apiError);
          setLoading(false);
        }

        return undefined;
      }
    },
    [request],
  );

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, error, loading, execute, reset };
}
