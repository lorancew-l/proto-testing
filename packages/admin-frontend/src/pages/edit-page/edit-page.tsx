import { useEffect } from 'react';
import { useParams } from 'react-router';

import { throttle } from 'lodash';

import { useGetResearchRequest, useUpdateResearchRequest } from '../../api';

import { Header } from './header';
import { PreviewPage } from './preview-page';
import { PublishPage } from './publish-page';
import { ResearchPage } from './research-page';
import { StatsPage } from './stats-page';
import { Section, useEditPageActions, useEditPageStore } from './store';

const sectionToComponent: Record<Section, React.ComponentType<{ isLoading: boolean }>> = {
  research: ResearchPage,
  preview: PreviewPage,
  publish: PublishPage,
  stats: StatsPage,
};

export const EditPage = () => {
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
        throttledUpdate(state);
      },
    );
  }, [isLoading]);

  return (
    <main>
      <Header />

      <PageContent isLoading={isLoading} />
    </main>
  );
};
