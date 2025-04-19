import type { Question } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { questionTypeToIcon } from '../common';

import { RichText } from './rich-text';

const useStyles = makeStyles()((theme) => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  icon: {
    color: theme.palette.primary.main,
  },
  index: {
    fontWeight: theme.typography.fontWeightBold,
    margin: theme.spacing(0, 0.5),
  },
}));

export const QuestionStatsCard = ({
  question,
  index,
  children,
}: {
  question: Question;
  index: number;
  children: React.ReactNode;
}) => {
  const { classes } = useStyles();
  const Icon = questionTypeToIcon[question.type];

  return (
    <div>
      <div className={classes.header}>
        <Icon className={classes.icon} />

        <div className={classes.index}>{`${index + 1}.`}</div>

        <RichText text={question.text} />
      </div>

      {children}
    </div>
  );
};
