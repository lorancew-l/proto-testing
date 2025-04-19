import type { SingleQuestion } from 'shared';

import { GenericAnswers } from './generic-answers';
import { QuestionStatsCard } from './question-stats-card';
import { GenericQuestionStats } from './types';

export const SingleQuestionStats = ({
  question,
  index,
  stats = {},
}: {
  question: SingleQuestion;
  index: number;
  stats: GenericQuestionStats | undefined;
}) => {
  return (
    <QuestionStatsCard question={question} index={index}>
      <GenericAnswers answers={question.answers} answersStats={stats} />
    </QuestionStatsCard>
  );
};
