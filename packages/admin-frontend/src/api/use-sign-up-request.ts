import { useCallback } from 'react';

import { SignUpUser, TokenResponse } from './types';
import { UseFetch, useFetch } from './use-fetch';

export const useSignUpRequest = (props?: UseFetch<TokenResponse>) => {
  const { fetchData, ...rest } = useFetch(props);

  const signUpUser = useCallback(
    (userData: SignUpUser) =>
      fetchData('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      }),
    [],
  );

  return {
    signUpUser,
    ...rest,
  };
};
