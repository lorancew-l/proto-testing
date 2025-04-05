import { useCallback } from 'react';

import { Research } from 'shared';

import { UseFetch, useFetch } from './use-fetch';

export const useUpdateResearchRequest = (props?: UseFetch<{ id: string; data: Research }>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const updateResearch = useCallback(
    (research: Research & { id: string }) => {
      return fetchData(`/api/research/${research.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: research }),
      });
    },
    [fetchData],
  );

  return {
    updateResearch,
    ...rest,
  };
};
