import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { useAuthContext } from '../auth-context';

export type UseFetch<T> = {
  withAuth?: boolean;
  onSuccess?(result: T, url: RequestInfo | URL): void;
  onError?(error: string): void;
};

export const useFetch = <T>({ onSuccess, onError, withAuth = false }: UseFetch<T> = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const isTriedRefresh = useRef(false);

  const navigate = useNavigate();

  const abortController = useRef<AbortController | null>(null);

  const actualOnSuccess = useRef(onSuccess);
  actualOnSuccess.current = onSuccess;

  const actualOnError = useRef(onError);
  actualOnError.current = onError;

  const { getToken, refreshTokens } = useAuthContext();

  const fetchData = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const onSuccess = actualOnSuccess.current;
      const onError = actualOnError.current;

      let data: T | null = null;

      const controller = new AbortController();

      try {
        setIsLoading(true);

        if (abortController.current) {
          abortController.current.abort();
        }

        abortController.current = controller;

        let token = withAuth ? await getToken() : null;

        const getFetchQuery = () =>
          fetch(input, {
            ...init,
            ...(withAuth && {
              headers: {
                ...init?.headers,
                Authorization: `Bearer ${token}`,
              },
              signal: abortController.current?.signal,
            }),
          });

        let response = await getFetchQuery();

        if (withAuth && !isTriedRefresh.current && response.status === 401) {
          isTriedRefresh.current = true;
          token = await refreshTokens();
          response = await getFetchQuery();
        }

        if (!response.ok) {
          if (response.status === 403) {
            navigate('/403');
            return null;
          }

          const error: { message: string } = await response.json();
          throw new Error(error.message);
        }

        isTriedRefresh.current = false;
        abortController.current = null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        onSuccess?.(data as T, input);
        setData(data);
        setError(null);
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error as Error);
        }

        if (onError && error instanceof Error) {
          onError(error?.message);
        } else {
          throw error;
        }
      } finally {
        if (!controller.signal.aborted) {
          abortController.current = null;
          setIsLoading(false);
        }
      }

      return data;
    },
    [withAuth, getToken, refreshTokens, navigate],
  );

  useEffect(() => {
    return () => abortController.current?.abort();
  }, []);

  return { isLoading, isError: !!error, error, data, fetchData };
};
