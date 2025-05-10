import type { FreeTextQuestion } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { GenericAnswer, TotalAnswers } from './generic-answers';
import { QuestionStatsCard } from './question-stats-card';
import { FreeTextQuestionStats as FreeTextQuestionStatsType } from './types';

const useStyles = makeStyles()((theme) => ({
  freeTextAnswers: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2.5, 2),
    marginBottom: theme.spacing(2.5),
    border: '1px solid #d5d6da',
    borderRadius: theme.shape.borderRadius * 3,
    maxHeight: 500,
    overflow: 'auto',
  },
  freeTextAnswer: {
    marginLeft: 'auto',
    backgroundColor: '#f4f6f8',
    padding: theme.spacing(1, 1.5),
    borderRadius: theme.shape.borderRadius * 2,
  },
  totalStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
  },
}));

export const FreeTextQuestionStats = ({
  question,
  index,
  stats = {},
}: {
  question: FreeTextQuestion;
  index: number;
  stats: FreeTextQuestionStatsType | undefined;
}) => {
  const { classes } = useStyles();
  return (
    <QuestionStatsCard question={question} index={index}>
      <ul className={classes.freeTextAnswers}>
        {stats.answers?.map((answer, index) => (
          <li key={index} className={classes.freeTextAnswer}>
            {answer}
          </li>
        ))}
      </ul>

      <div className={classes.totalStats}>
        {!!stats.skipped && <GenericAnswer text="Пропущен" count={stats.skipped} total={stats.total ?? 0} />}

        <TotalAnswers total={stats.total} tag="div" />
      </div>
    </QuestionStatsCard>
  );
};
