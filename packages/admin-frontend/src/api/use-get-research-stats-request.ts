import { useCallback } from 'react';

import { UseFetch, useFetch } from './use-fetch';

export type PrototypeQuestionSessionStats = {
  id: string;
  startTs: number;
  endTs: number;
  completed: boolean;
  givenUp: boolean;
  answers: PrototypeScreenAnswerStats[];
};

export type PrototypeScreenAnswerStats = {
  screenId: string;
  startTs: number;
  endTs: number;
  ssid: string;
  clicks: { x: number; y: number; areaId: string | null; ts: number }[];
};

export type PrototypeQuestionClickStats = PrototypeScreenAnswerStats['clicks'];

export type PrototypeSessionAggregateStats = {
  count: number;
  avgTime: number;
  medianTime: number;
};

export type PrototypeQuestionStats = {
  general: {
    total: PrototypeSessionAggregateStats;
    completed: PrototypeSessionAggregateStats;
    givenUp: PrototypeSessionAggregateStats;
    screenTime: Record<string, { avgTime: number; medianTime: number }>;
  };
  sessions: PrototypeQuestionSessionStats[];
};

export type GenericQuestionStats = Record<string, number> & { skipped?: number; total?: number };
export type FreeTextQuestionStats = { answers?: string[]; skipped?: number; total?: number };

export type Session = { session_id: string; ts: number; os: string; device: string; browser: string };

interface Stats {
  load?: number;
  start?: number;
  finish?: number;
  avgSessionTime: number;
  answers: Record<string, GenericQuestionStats | FreeTextQuestionStats | PrototypeQuestionStats>;
  sessions: Session[];
}

export const useGetResearchStatsRequest = (props?: UseFetch<Stats>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const getResearchStats = useCallback(
    (id: string, sessionId: string | null) => {
      const params = new URLSearchParams();
      if (sessionId) params.set('session_id', sessionId);
      return fetchData(`/api/stats/${id}${params.size ? '?' + params.toString() : ''}`, { method: 'GET' });
    },
    [fetchData],
  );

  return {
    getResearchStats,
    ...rest,
  };
};
