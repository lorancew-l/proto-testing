import type { Question } from 'shared';

import { AnswerStackRecord } from '../research-machine/types';

export type QuestionProps<T extends Question['type']> = {
  question: Extract<Question, { type: T }>;
  state: Extract<AnswerStackRecord, { type: T }>;
};
