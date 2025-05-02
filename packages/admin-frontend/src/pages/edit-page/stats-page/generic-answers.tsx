import { makeStyles } from 'tss-react/mui';

import { RichText } from '../rich-text';

import { GenericQuestionStats } from './types';

const useStyles = makeStyles()((theme) => ({
  answerList: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
    padding: 0,
  },
  total: {
    color: theme.palette.action.active,
    marginLeft: 'auto',
  },
  totalValue: {
    color: 'black',
    fontWeight: theme.typography.fontWeightBold,
  },
}));

export const GenericAnswers = ({
  answers,
  answersStats,
}: {
  answers: { id: string; text: string }[];
  answersStats: GenericQuestionStats;
}) => {
  const { classes } = useStyles();

  return (
    <ol className={classes.answerList}>
      {answers.map((answer) => (
        <GenericAnswer key={answer.id} text={answer.text} count={answersStats[answer.id] ?? 0} total={answersStats.total ?? 0} />
      ))}

      <li className={classes.total}>
        <span>Ответов: </span>
        <span className={classes.totalValue}>{answersStats.total ?? 0}</span>
      </li>
    </ol>
  );
};

const useAnswerStyles = makeStyles<{ width: number }>()((theme, { width }) => ({
  answerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    '&:not(:last-child)': {
      marginBottom: theme.spacing(1),
    },
  },
  answerText: {
    flexGrow: 1,
    minWidth: 0,
    p: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  bar: {
    flexGrow: 1,
    height: 16,
    backgroundColor: '#d5d6da',
    borderRadius: theme.shape.borderRadius * 1.5,
    position: 'relative',
    '&::after': {
      content: "''",
      position: 'absolute',
      left: 0,
      top: 0,
      height: '100%',
      width: `${width}%`,
      backgroundColor: theme.palette.primary.main,
      borderRadius: theme.shape.borderRadius * 1.5,
    },
  },
  count: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontWeight: theme.typography.fontWeightBold,
  },
  percent: {
    color: theme.palette.action.active,
    fontWeight: theme.typography.fontWeightMedium,
  },
}));

export const GenericAnswer = ({ text, count, total }: { text: string; count: number; total: number }) => {
  const percent = total ? Math.floor((count / total) * 100) : 0;
  const { classes } = useAnswerStyles({ width: percent });

  return (
    <li>
      <div className={classes.answerRow}>
        <RichText text={text} className={classes.answerText} />

        <div className={classes.count}>
          {count}
          <div className={classes.percent}>{`(${percent}%)`}</div>
        </div>
      </div>

      <div className={classes.bar} />
    </li>
  );
};
