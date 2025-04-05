import { useCallback } from 'react';

import { Research } from 'shared';

import { UseFetch, useFetch } from './use-fetch';

export const useGetResearchListRequest = (props?: UseFetch<(Research & { id: string })[]>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const getResearchList = useCallback(() => {
    return fetchData('/api/research', {
      method: 'GET',
    });
  }, [fetchData]);

  return {
    getResearchList,
    ...rest,
  };
};
