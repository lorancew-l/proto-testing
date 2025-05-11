import { useCallback } from 'react';

import { useFetch } from './use-fetch';

export type ResearchSuggestionField = 'device' | 'os' | 'browser' | 'referer';

export const useGetResearchFilterSuggestionsRequest = <T extends ResearchSuggestionField>(filter: T) => {
  const { fetchData, ...rest } = useFetch<T extends 'referer' ? Record<string, string[]> : string[]>({
    withAuth: true,
  });

  const getResearchFilterSuggestions = useCallback(
    (researchId: string) => {
      return fetchData(`/api/stats/${researchId}/suggestions/${filter}`, { method: 'GET' });
    },
    [fetchData, filter],
  );

  return {
    getResearchFilterSuggestions,
    ...rest,
  };
};
