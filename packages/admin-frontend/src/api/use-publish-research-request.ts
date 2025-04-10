import { useCallback } from 'react';

import { Research } from 'shared';

import { UseFetch, useFetch } from './use-fetch';

export const usePublishResearchRequest = (props?: UseFetch<{ url: string }>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const publishResearch = useCallback(
    (research: Research & { id: string }) => {
      return fetchData(`/api/research/${research.id}/publish`, {
        method: 'POST',
      });
    },
    [fetchData],
  );

  return {
    publishResearch,
    ...rest,
  };
};
