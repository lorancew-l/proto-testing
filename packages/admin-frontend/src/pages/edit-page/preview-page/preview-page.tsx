import { useMemo } from 'react';

import { makeStyles } from 'tss-react/mui';

import { useEditPageActions } from '../store';

const useStyles = makeStyles()(() => ({
  research: {
    width: '100vw',
    height: 'calc(100vh - 44px)',
    position: 'relative',
  },
  loader: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%,-50%)',
  },
  iframe: {
    border: 'none',
    margin: 0,
    display: 'block',
    width: '100vw',
    height: 'calc(100dvh - 44px)',
  },
}));

export const PreviewPage = () => {
  const { classes } = useStyles();
  const { getResearch } = useEditPageActions();

  const previewPage = useMemo(() => {
    return `
      <html>
        <head>
          <title>Research preview</title>
        </head>
        <body>
          <div id="research-root"></div>
          <script>
            window.DEV_MODE = true;
            window.research=${JSON.stringify({ ...getResearch(), revision: 1 })}
          </script>
          <script src="${import.meta.env.VITE_RESPONDENT_ENTRYPOINT_URL}"></script>
      </html>
    `;
  }, [getResearch]);

  return (
    <section className={classes.research}>
      <iframe className={classes.iframe} srcDoc={previewPage} width="100vw" height="calc(100dvh - 44px)" />
    </section>
  );
};
