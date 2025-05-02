import { useEffect } from 'react';
import { useParams } from 'react-router';

import { useGetResearchRequest } from '../../api';

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
    onSuccess: ({ id, name, data, publishedUrl, publishedRevision }) => {
      setResearch(data, { id, name, publishedUrl, publishedRevision });
    },
  });

  useEffect(() => {
    const id = params.id;
    if (id) {
      void getResearch(id);
    }
  }, [params.id]);

  return (
    <main>
      <Header />

      <PageContent isLoading={isLoading} />
    </main>
  );
};
