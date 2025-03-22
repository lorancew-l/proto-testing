import { useCallback } from 'react';

import { SignInUser, TokenResponse } from './types';
import { UseFetch, useFetch } from './use-fetch';

export const useSignInRequest = (props?: UseFetch<TokenResponse>) => {
  const { fetchData, ...rest } = useFetch(props);

  const signInUser = useCallback(
    (userData: SignInUser) =>
      fetchData('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      }),
    [],
  );

  return {
    signInUser,
    ...rest,
  };
};
