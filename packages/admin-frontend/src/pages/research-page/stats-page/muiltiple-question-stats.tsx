import type { MultipleQuestion } from 'shared';

import { GenericAnswers } from './generic-answers';
import { QuestionStatsCard } from './question-stats-card';
import { GenericQuestionStats } from './types';

export const MultipleQuestionStats = ({
  question,
  index,
  stats = {},
}: {
  question: MultipleQuestion;
  index: number;
  stats: GenericQuestionStats | undefined;
}) => {
  return (
    <QuestionStatsCard question={question} index={index}>
      <GenericAnswers answers={question.answers} answersStats={stats} />
    </QuestionStatsCard>
  );
};
