import { useState } from 'react';

import { Button, CircularProgress, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { usePublishResearchRequest } from '../../../api';
import { useEditPageActions } from '../store';

const useStyles = makeStyles()((theme) => ({
  wrapper: {
    margin: '0 auto',
    width: 500,
    padding: theme.spacing(3, 0),
  },
  content: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius * 4,
    border: `1px solid #d5d6da`,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
  },
}));

export const PublishPage = () => {
  const { classes } = useStyles();

  const { getResearch } = useEditPageActions();
  const [publishedLink, setPublishedLink] = useState('');

  const { isLoading, publishResearch } = usePublishResearchRequest({
    onSuccess: ({ url }) => {
      setPublishedLink(url);
    },
  });

  return (
    <section className={classes.wrapper}>
      <div className={classes.content}>
        <div className={classes.row}>
          <Typography>Опрос не был опубликован</Typography>

          <Button
            type="button"
            variant="contained"
            sx={{ borderRadius: 2.5 }}
            onClick={() => publishResearch(getResearch())}
            disableElevation
          >
            {isLoading ? <CircularProgress /> : 'Опубликовать'}
          </Button>

          {publishedLink}
        </div>
      </div>
    </section>
  );
};
