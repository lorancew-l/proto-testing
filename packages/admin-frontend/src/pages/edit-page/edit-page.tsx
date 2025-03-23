import { makeStyles } from 'tss-react/mui';

import { Header } from './header';
import { PreviewPage } from './preview-page';
import { ResearchPage } from './research-page';
import { StatsPage } from './stats-page';
import { Section, useEditPageStore } from './store';

const useStyles = makeStyles()((theme) => ({
  content: {
    margin: '0 auto',
    width: 500,
    padding: theme.spacing(3, 0),
  },
}));

const sectionToComponent: Record<Section, React.ComponentType> = {
  research: ResearchPage,
  preview: PreviewPage,
  stats: StatsPage,
};

export const EditPage = () => {
  const { classes } = useStyles();

  const section = useEditPageStore((state) => state.section);
  const PageContent = sectionToComponent[section];

  return (
    <main>
      <Header />

      <section className={classes.content}>
        <PageContent />
      </section>
    </main>
  );
};
