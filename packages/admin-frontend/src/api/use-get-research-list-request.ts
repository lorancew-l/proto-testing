import { useCallback } from 'react';

import { UseFetch, useFetch } from './use-fetch';

export const useGetResearchListRequest = (
  props?: UseFetch<
    {
      id: string;
      name: string;
      load: number;
      createdAt: string;
      publishedAt: string | null;
      updatedAt: string | null;
    }[]
  >,
) => {
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
