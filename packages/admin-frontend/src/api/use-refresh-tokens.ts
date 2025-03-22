import { useCallback } from 'react';

import { TokenResponse } from './types';
import { UseFetch, useFetch } from './use-fetch';

export const useRefreshTokens = (props?: UseFetch<TokenResponse>) => {
  const { fetchData } = useFetch(props);

  const refresh = useCallback(
    (refresh_token: string) =>
      fetchData('/api/auth/refresh', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refresh_token}`,
        },
      }),
    [],
  );

  return {
    refresh,
  };
};
