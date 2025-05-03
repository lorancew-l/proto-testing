import { memo } from 'react';

import { Question as ResearchQuestion } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { FreeTextQuestionStats } from './free-text-question-stats';
import { MultipleQuestionStats } from './muiltiple-question-stats';
import { PrototypeQuestionStats } from './prototype-question-stats';
import { RatingQuestionStats } from './rating-question-stats';
import { SingleQuestionStats } from './single-question-stats';
import type {
  FreeTextQuestionStats as FreeTextQuestionStatsType,
  GenericQuestionStats,
  PrototypeQuestionStats as PrototypeQuestionStatsType,
  Stats,
} from './types';

const useStyles = makeStyles()((theme) => ({
  questionWrapper: {
    appearance: 'none',
    listStyleType: 'none',
    width: '100%',
    boxSizing: 'border-box',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius * 4,
    border: `1px solid #d5d6da`,
  },
}));

type QuestionType = ResearchQuestion['type'];

const questionTypeToComponent: {
  [T in QuestionType]: React.ComponentType<{
    question: Extract<ResearchQuestion, { type: T }>;
    index: number;
    stats: T extends 'prototype'
      ? PrototypeQuestionStatsType | undefined
      : T extends 'free-text'
        ? FreeTextQuestionStatsType | undefined
        : GenericQuestionStats | undefined;
  }>;
} = {
  single: SingleQuestionStats,
  multiple: MultipleQuestionStats,
  rating: RatingQuestionStats,
  'free-text': FreeTextQuestionStats,
  prototype: PrototypeQuestionStats,
};

export const QuestionStats = memo(({ question, index, stats }: { question: ResearchQuestion; index: number; stats: Stats }) => {
  const Component = questionTypeToComponent[question.type] as React.ComponentType<{
    question: ResearchQuestion;
    index: number;
    stats: GenericQuestionStats | FreeTextQuestionStatsType | PrototypeQuestionStatsType | undefined;
  }>;

  return (
    <QuestionStatsWrapper>
      <Component question={question} index={index} stats={stats[question.id]} />
    </QuestionStatsWrapper>
  );
});

QuestionStats.displayName = 'QuestionStats';

const QuestionStatsWrapper = ({ children }: { children: React.ReactNode }) => {
  const { classes } = useStyles();
  return <li className={classes.questionWrapper}>{children}</li>;
};
