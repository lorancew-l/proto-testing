import { range } from 'lodash';

import type { RatingQuestion } from 'shared';

import { GenericAnswers } from './generic-answers';
import { QuestionStatsCard } from './question-stats-card';
import { GenericQuestionStats } from './types';

export const RatingQuestionStats = ({
  question,
  index,
  stats = {},
}: {
  question: RatingQuestion;
  index: number;
  stats: GenericQuestionStats | undefined;
}) => {
  const answers = range(question.min, question.max + 1).map((rating) => ({ id: rating.toString(), text: rating.toString() }));

  return (
    <QuestionStatsCard question={question} index={index}>
      <GenericAnswers answers={answers} answersStats={stats} />
    </QuestionStatsCard>
  );
};
