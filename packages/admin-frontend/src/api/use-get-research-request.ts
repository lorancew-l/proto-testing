import { useCallback } from 'react';

import { Research } from 'shared';

import { UseFetch, useFetch } from './use-fetch';

export const useGetResearchRequest = (props?: UseFetch<{ id: string; data: Research }>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const getResearch = useCallback(
    (id: string) => {
      return fetchData(`/api/research/${id}`, {
        method: 'GET',
      });
    },
    [fetchData],
  );

  return {
    getResearch,
    ...rest,
  };
};
