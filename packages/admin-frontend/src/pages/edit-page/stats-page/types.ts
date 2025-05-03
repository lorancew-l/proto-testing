import {
  FreeTextQuestionStats,
  GenericQuestionStats,
  PrototypeQuestionClickStats,
  PrototypeQuestionSessionStats,
  PrototypeQuestionStats,
} from '../../../api/use-get-research-stats-request';

export type Stats = Record<string, GenericQuestionStats | FreeTextQuestionStats | PrototypeQuestionStats | undefined>;
export type {
  FreeTextQuestionStats,
  GenericQuestionStats,
  PrototypeQuestionClickStats,
  PrototypeQuestionSessionStats,
  PrototypeQuestionStats,
};
