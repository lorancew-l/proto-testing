import { useEffect } from 'react';

import { range, throttle } from 'lodash';

import { Skeleton } from '@mui/material';

import { generateQuestion } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { useUpdateResearchRequest } from '../../../api';
import { useEditPageActions, useEditPageStore } from '../store';

import { ContentSidebar } from './content-sidebar/content-sidebar';
import { Question } from './questions';
import { SettingsSidebar } from './settings-sidebar';

const useStyles = makeStyles()((theme) => ({
  container: {
    padding: theme.spacing(3),
    display: 'flex',
    flexWrap: 'nowrap',
    gap: theme.spacing(4),
    justifyContent: 'space-between',
    height: `calc(100vh - 44px)`,
    maxHeight: `calc(100vh - 44px)`,
    overflow: 'auto',
  },
  content: {
    margin: '0 auto',
    width: 500,
  },
  list: {
    all: 'unset',
    appearance: 'none',
    display: 'flex',
    flexDirection: 'column',
  },
}));

const skeletonQuestions = range(5).map(() => generateQuestion('single'));

export const EditPage = ({ isLoading }: { isLoading: boolean }) => {
  const { classes } = useStyles();
  const questions = useEditPageStore((state) => state.research.questions);

  const { setActiveEntity } = useEditPageActions();
  const { updateResearch } = useUpdateResearchRequest();

  useEffect(() => {
    if (isLoading) return;

    const throttledUpdate = throttle(updateResearch, 5000);

    return useEditPageStore.subscribe(
      (state) => ({ id: state.researchMetadata.id, name: state.researchMetadata.name, data: state.research }),
      (state) => {
        throttledUpdate(state.id, state.name, state.data);
      },
    );
  }, [isLoading]);

  const setResearchActive = () => {
    setActiveEntity({ type: 'research' });
  };

  return (
    <div className={classes.container} onClick={setResearchActive}>
      <ContentSidebar isLoading={isLoading} />

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

      <SettingsSidebar isLoading={isLoading} />
    </div>
  );
};
