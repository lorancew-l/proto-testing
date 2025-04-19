import { useCallback } from 'react';

import { UseFetch, useFetch } from './use-fetch';

export type PrototypeQuestionClickStats = {
  x: number;
  y: number;
  screenId: string;
  ts: number;
  areaId: string | null;
}[];

export type PrototypeQuestionSessionStats = {
  id: string;
  clicks: {
    x: number;
    y: number;
    ssid: string;
    screenId: string;
    ts: number;
    areaId: string | null;
  }[];
  screenTime: Record<string, number>;
  startTs: number;
  endTs: number;
  completed: boolean;
  givenUp: boolean;
};

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

export type GenericQuestionStats = Record<string, number> & { total?: number };

interface Stats {
  load?: number;
  start?: number;
  finish?: number;
  avgSessionTime: number;
  answers: Record<string, GenericQuestionStats | PrototypeQuestionStats>;
}

export const useGetResearchStatsRequest = (props?: UseFetch<Stats>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const getResearchStats = useCallback(
    (id: string) => {
      return fetchData(`/api/stats/${id}`, { method: 'GET' });
    },
    [fetchData],
  );

  return {
    getResearchStats,
    ...rest,
  };
};
