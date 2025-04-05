import { useCallback } from 'react';

import { UseFetch, useFetch } from './use-fetch';

export const useCreateResearchRequest = (props?: UseFetch<{ id: string }>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const createResearch = useCallback(() => {
    return fetchData('/api/research', {
      method: 'POST',
    });
  }, [fetchData]);

  return {
    createResearch,
    ...rest,
  };
};
