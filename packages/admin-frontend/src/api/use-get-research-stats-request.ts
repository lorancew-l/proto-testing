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

export type Session = { session_id: string; ts: string; os: string; device: string; browser: string };

interface Stats {
  load?: number;
  start?: number;
  finish?: number;
  avgSessionTime: number;
  answers: Record<string, GenericQuestionStats | FreeTextQuestionStats | PrototypeQuestionStats>;
  sessions: Session[];
}

export type StatFilter = {
  completed: 'all' | 'uncompleted' | 'completed';
  referer: { key: string; value: string[] | null } | null;
  device: string[] | null;
  os: string[] | null;
  browser: string[] | null;
  answer: {
    operators: ('or' | 'and')[];
    operands: {
      id: string;
      type: 'single' | 'multiple' | 'rating' | 'free-text' | 'prototype';
      questionId: string;
      answers: string[];
    }[];
  } | null;
};

export const useGetResearchStatsRequest = (props?: UseFetch<Stats>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const getResearchStats = useCallback(
    (id: string, sessionId: string | null, filter: StatFilter | null) => {
      return fetchData(`/api/stats/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          ...filter,
        }),
      });
    },
    [fetchData],
  );

  return {
    getResearchStats,
    ...rest,
  };
};
