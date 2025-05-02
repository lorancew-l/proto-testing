import { Injectable } from '@nestjs/common';

import type { Question } from 'shared';
import { DatabaseService } from 'src/database/database.service';

import { StatisticsProviderService } from './statistics-provider.service';

type GenericQuestionStats = Record<string | number, number> & { total: number };

type PrototypeQuestionSessionStats = {
  startTs: number;
  endTs: number;
  completed: boolean;
  givenUp: boolean;
  answers: PrototypeScreenAnswers[];
};

type PrototypeScreenAnswers = {
  screenId: string;
  startTs: number;
  endTs: number;
  ssid: string;
  clicks: { x: number; y: number; areaId: string | null; ts: number }[];
};

type PrototypeSessionAggregateStats = {
  count: number;
  avgTime: number;
  medianTime: number;
};

type PrototypeQuestionStats = {
  general: {
    total: PrototypeSessionAggregateStats;
    completed: PrototypeSessionAggregateStats;
    givenUp: PrototypeSessionAggregateStats;
    screenTime: Record<string, { avgTime: number; medianTime: number }>;
  };
  sessions: (PrototypeQuestionSessionStats & { id: string })[];
};

type QuestionStats = GenericQuestionStats | PrototypeQuestionStats;

type QuestionsAnswersStats = Record<string, QuestionStats>;

@Injectable()
export class ResearchStatisticsService {
  constructor(
    private readonly statisticsProviderService: StatisticsProviderService,
    private readonly databaseService: DatabaseService,
  ) {}

  private async getLatestRevision(researchId: string) {
    const foundResearch = await this.databaseService.publishedResearch.findFirst({
      orderBy: { revision: 'desc' },
      where: { id: researchId },
      select: { revision: true },
    });
    return foundResearch ? foundResearch.revision : null;
  }

  public async getResearchLoadCount(researchId: string, revision?: number) {
    const resolvedRevision = revision ?? (await this.getLatestRevision(researchId)) ?? 1;

    const result = await this.statisticsProviderService.query({
      query: `
        SELECT
          COUNT(type) AS count
        FROM
          research_events
        WHERE
          research_id = {research_id: String}
        AND
          revision = {revision: UInt16}
        AND
          type = 'research-load'`,
      query_params: { research_id: researchId, revision: resolvedRevision },
      format: 'JSONEachRow',
    });

    const [{ count }] = await result.json<{ count: string }>();
    return Number(count);
  }

  private async getGeneralStats(researchId: string, revision: number) {
    const result = await this.statisticsProviderService.query({
      query: `
        SELECT
          type,
          COUNT(type) AS count
        FROM
          research_events
        WHERE
          research_id = {research_id: String}
        AND
          revision = {revision: UInt16}
        GROUP BY
          type`,
      query_params: { research_id: researchId, revision },
      format: 'JSONEachRow',
    });

    const stats = await result.json<{ type: string; count: string }>();
    return stats.reduce<Record<string, number>>((result, { type, count }) => {
      result[type.replace('research-', '')] = Number(count);
      return result;
    }, {});
  }

  private async getAverageSessionDuration(researchId: string, revision: number) {
    const result = await this.statisticsProviderService.query({
      query: `
        SELECT
          AVG(session_duration) AS avg_session_duration
        FROM (
          SELECT
            max(ts) - min(ts) AS session_duration
          FROM 
            research_events
          WHERE
            research_id = {research_id: String}
          AND
            revision = {revision: UInt16}
          GROUP BY
            research_id, session_id
        )
        `,
      query_params: { research_id: researchId, revision },
      format: 'JSONEachRow',
    });

    const [{ avg_session_duration }] = await result.json<{ avg_session_duration: number }>();
    return avg_session_duration * 1000;
  }

  private async getQuestionAnswerStats(researchId: string, revision: number): Promise<QuestionsAnswersStats> {
    const result = await this.statisticsProviderService.query({
      query: `
        SELECT
          session_id,
          question_id,
          question_type,
          answers
        FROM
          research_events
        WHERE
          research_id = {research_id: String}
        AND
          type='research-answer'
        AND
          revision = {revision: UInt16}
        ORDER BY
          ts ASC
        `,
      query_params: { research_id: researchId, revision },
      format: 'JSONEachRow',
    });

    const questionAnswerStats: QuestionsAnswersStats = {};
    const prototypeAggregatedStats: Map<
      string,
      { total: number[]; completed: number[]; givenUp: number[]; screenTime: Record<string, number[]> }
    > = new Map();

    for (const row of await result.json<{
      session_id: string;
      question_id: string;
      question_type: Question['type'];
      answers: string;
    }>()) {
      if (row.question_type === 'single' || row.question_type === 'multiple' || row.question_type === 'rating') {
        let stats = questionAnswerStats[row.question_id] as GenericQuestionStats | undefined;
        const answers = JSON.parse(row.answers) as string[];

        if (!stats) {
          stats = { total: 0 };
          questionAnswerStats[row.question_id] = stats;
        }

        for (const answer of answers) {
          stats[answer] = (stats[answer] ?? 0) + 1;
        }

        stats.total += 1;
      }

      if (row.question_type === 'prototype') {
        let stats = questionAnswerStats[row.question_id] as PrototypeQuestionStats | undefined;
        let prototypeStats = prototypeAggregatedStats.get(row.question_id);

        if (!prototypeStats) {
          prototypeStats = {
            total: [],
            completed: [],
            givenUp: [],
            screenTime: {},
          };
          prototypeAggregatedStats.set(row.question_id, prototypeStats);
        }

        if (!stats) {
          stats = {
            general: {
              total: { count: 0, avgTime: 0, medianTime: 0 },
              completed: { count: 0, avgTime: 0, medianTime: 0 },
              givenUp: { count: 0, avgTime: 0, medianTime: 0 },
              screenTime: {},
            },
            sessions: [],
          };
          questionAnswerStats[row.question_id] = stats;
        }

        const session = JSON.parse(row.answers) as PrototypeQuestionSessionStats;

        const duration = session.endTs - session.startTs;
        prototypeStats.total.push(duration);
        if (session.completed) prototypeStats.completed.push(duration);
        if (session.givenUp) prototypeStats.givenUp.push(duration);

        session.answers.forEach(({ screenId, startTs, endTs }) => {
          const duration = endTs - startTs;
          const screenTime = prototypeStats.screenTime[screenId] ?? [];
          screenTime.push(duration);
          prototypeStats.screenTime[screenId] = screenTime;
        });

        stats.sessions.push({ ...session, id: row.session_id });
      }

      prototypeAggregatedStats.forEach((aggregatedStats, id) => {
        const stats = questionAnswerStats[id] as PrototypeQuestionStats | undefined;
        if (stats) {
          stats.general = {
            total: calculateAggregatedSessionStats(aggregatedStats.total),
            completed: calculateAggregatedSessionStats(aggregatedStats.completed),
            givenUp: calculateAggregatedSessionStats(aggregatedStats.givenUp),
            screenTime: Object.entries(aggregatedStats.screenTime).reduce<PrototypeQuestionStats['general']['screenTime']>(
              (result, [screenId, timeList]) => {
                const stats = calculateAggregatedSessionStats(timeList);

                result[screenId] = {
                  avgTime: stats.avgTime,
                  medianTime: stats.medianTime,
                };

                return result;
              },
              {},
            ),
          };
        }
      });
    }

    return questionAnswerStats;
  }

  public async getStatistics(researchId: string, revision?: number) {
    const resolvedRevision = revision ?? (await this.getLatestRevision(researchId)) ?? 1;

    const [generalStats, avgSessionTime, questionAnswersStats] = await Promise.all([
      this.getGeneralStats(researchId, resolvedRevision),
      this.getAverageSessionDuration(researchId, resolvedRevision),
      this.getQuestionAnswerStats(researchId, resolvedRevision),
    ]);

    return {
      ...generalStats,
      answers: questionAnswersStats,
      avgSessionTime,
      revision: resolvedRevision,
    };
  }
}

function calculateAggregatedSessionStats(rawStats: number[]): PrototypeSessionAggregateStats {
  return {
    avgTime: calculateAverage(rawStats),
    medianTime: calculateMedian(rawStats),
    count: rawStats.length,
  };
}

function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) {
    return 0;
  }
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  return sum / numbers.length;
}

function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) {
    return 0;
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}
