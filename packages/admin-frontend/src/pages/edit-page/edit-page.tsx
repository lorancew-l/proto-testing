import { useEffect } from 'react';
import { useParams } from 'react-router';

import { throttle } from 'lodash';

import { makeStyles } from 'tss-react/mui';

import { useGetResearchRequest, useUpdateResearchRequest } from '../../api';

import { Header } from './header';
import { PreviewPage } from './preview-page';
import { ResearchPage } from './research-page';
import { StatsPage } from './stats-page';
import { Section, useEditPageActions, useEditPageStore } from './store';

const useStyles = makeStyles()((theme) => ({
  content: {
    margin: '0 auto',
    width: 500,
    padding: theme.spacing(3, 0),
  },
}));

const sectionToComponent: Record<Section, React.ComponentType<{ isLoading: boolean }>> = {
  research: ResearchPage,
  preview: PreviewPage,
  stats: StatsPage,
};

export const EditPage = () => {
  const { classes } = useStyles();

  const section = useEditPageStore((state) => state.section);
  const PageContent = sectionToComponent[section];

  const { setResearch } = useEditPageActions();

  const params = useParams<{ id?: string }>();
  const { isLoading, getResearch } = useGetResearchRequest({
    onSuccess: ({ id, data }) => {
      setResearch({ ...data, id });
    },
  });
  const { updateResearch } = useUpdateResearchRequest();

  useEffect(() => {
    const id = params.id;
    if (id) {
      void getResearch(id);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const throttledUpdate = throttle(updateResearch, 5000);

    return useEditPageStore.subscribe(
      (state) => state.research,
      (state) => {
        console.log('test');
        throttledUpdate(state);
      },
    );
  }, [isLoading]);

  return (
    <main>
      <Header />

      <section className={classes.content}>
        <PageContent isLoading={isLoading} />
      </section>
    </main>
  );
};
