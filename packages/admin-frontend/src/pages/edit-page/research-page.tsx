import { makeStyles } from 'tss-react/mui';

import { Question } from './questions/question';
import { useEditPageStore } from './store';

const useStyles = makeStyles()(() => ({
  list: {
    all: 'unset',
    appearance: 'none',
    display: 'flex',
    flexDirection: 'column',
  },
}));

export const ResearchPage = () => {
  const { classes } = useStyles();
  const questions = useEditPageStore((state) => state.research.data.questions);

  return (
    <ol className={classes.list}>
      {questions.map((question, index) => (
        <Question key={question.id} question={question} index={index} last={index === questions.length - 1} />
      ))}
    </ol>
  );
};
