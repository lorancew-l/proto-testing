import { useEffect } from 'react';

import { range, throttle } from 'lodash';

import { Skeleton } from '@mui/material';

import { generateQuestion } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { useUpdateResearchRequest } from '../../api';

import { Question } from './questions';
import { useEditPageStore } from './store';

const useStyles = makeStyles()((theme) => ({
  content: {
    margin: '0 auto',
    width: 500,
    padding: theme.spacing(3, 0),
  },
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

  const { updateResearch } = useUpdateResearchRequest();

  useEffect(() => {
    if (isLoading) return;

    const throttledUpdate = throttle(updateResearch, 5000);

    return useEditPageStore.subscribe(
      (state) => ({ data: state.research, id: state.researchMetadata.id }),
      (state) => {
        throttledUpdate(state.id, state.data);
      },
    );
  }, [isLoading]);

  return (
    <section className={classes.content}>
      <ol className={classes.list}>
        {isLoading &&
          skeletonQuestions.map((question, index) => (
            <Skeleton sx={{ transform: 'none', marginBottom: 3 }} key={question.id} width={500} height={146}>
              <Question question={question} index={index} />
            </Skeleton>
          ))}

        {!isLoading && questions.map((question, index) => <Question key={question.id} question={question} index={index} />)}
      </ol>
    </section>
  );
};
