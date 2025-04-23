import { useCallback } from 'react';

import { SavedResearch } from './types';
import { UseFetch, useFetch } from './use-fetch';

export const usePublishResearchRequest = (props?: UseFetch<SavedResearch>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const publishResearch = useCallback(
    (researchId: string, { increaseRevision, pauseResearch }: { increaseRevision: boolean; pauseResearch: boolean }) => {
      return fetchData(
        `/api/research/${researchId}/publish?increaseRevision=${increaseRevision}&pauseResearch=${pauseResearch}`,
        {
          method: 'POST',
        },
      );
    },
    [fetchData],
  );

  return {
    publishResearch,
    ...rest,
  };
};
