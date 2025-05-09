import { useCallback } from 'react';

import { SavedResearch } from './types';
import { UseFetch, useFetch } from './use-fetch';

export const useGetResearchRequest = (props?: UseFetch<SavedResearch>) => {
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
