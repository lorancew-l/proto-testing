import { range } from 'lodash';

import { Skeleton } from '@mui/material';

import { generateQuestion } from 'shared';
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

const skeletonQuestions = range(5).map(() => generateQuestion('single'));

export const ResearchPage = ({ isLoading }: { isLoading: boolean }) => {
  const { classes } = useStyles();
  const questions = useEditPageStore((state) => state.research.questions);

  return (
    <ol className={classes.list}>
      {isLoading &&
        skeletonQuestions.map((question, index) => (
          <Skeleton sx={{ transform: 'none', marginBottom: 3 }} key={question.id} width={500} height={146}>
            <Question question={question} index={index} last={index === skeletonQuestions.length - 1} />
          </Skeleton>
        ))}

      {!isLoading &&
        questions.map((question, index) => (
          <Question key={question.id} question={question} index={index} last={index === questions.length - 1} />
        ))}
    </ol>
  );
};
