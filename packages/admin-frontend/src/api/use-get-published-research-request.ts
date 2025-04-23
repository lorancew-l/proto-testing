import { useCallback } from 'react';

import { PublishedResearch } from './types';
import { UseFetch, useFetch } from './use-fetch';

export const useGetPublishedResearchRequest = (props?: UseFetch<PublishedResearch>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const getPublishedResearch = useCallback(
    (id: string) => {
      return fetchData(`/api/research/published/${id}`, {
        method: 'GET',
      });
    },
    [fetchData],
  );

  return {
    getPublishedResearch,
    ...rest,
  };
};
