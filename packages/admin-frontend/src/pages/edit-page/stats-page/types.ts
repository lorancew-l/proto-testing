import {
  GenericQuestionStats,
  PrototypeQuestionClickStats,
  PrototypeQuestionSessionStats,
  PrototypeQuestionStats,
} from '../../../api/use-get-research-stats-request';

export type Stats = Record<string, GenericQuestionStats | PrototypeQuestionStats | undefined>;
export type { GenericQuestionStats, PrototypeQuestionClickStats, PrototypeQuestionSessionStats, PrototypeQuestionStats };
