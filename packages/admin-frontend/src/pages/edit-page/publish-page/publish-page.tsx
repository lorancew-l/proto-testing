import { useState } from 'react';

import { pick } from 'lodash';

import LinkIcon from '@mui/icons-material/Link';
import { Button, CircularProgress, Divider, Switch, TextField, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { usePublishResearchRequest, useUpdateResearchRequest } from '../../../api';
import { useEditPageActions, useEditPageStore } from '../store';

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
    gap: theme.spacing(2),
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  control: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    width: '100%',
  },
  urlField: {
    '& .MuiInputBase-input': {
      padding: theme.spacing(0.5, 1),
    },
    '& .MuiInputBase-root': {
      borderRadius: theme.shape.borderRadius * 2,
    },
  },
  publishButtonWrapper: {
    position: 'relative',
    marginLeft: 'auto',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    height: 16,
    width: 16,
  },
}));

export const PublishPage = () => {
  const { classes } = useStyles();

  const { getResearch, setResearch, getResearchMetadata } = useEditPageActions();

  const publishedUrl = useEditPageStore((store) => store.researchMetadata.publishedUrl);

  const [pauseResearch, setPauseResearch] = useState(false);
  const [increaseRevision, setIncreaseRevision] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const { updateResearch } = useUpdateResearchRequest();
  const { publishResearch } = usePublishResearchRequest();

  const saveAndPublish = async () => {
    try {
      setIsLoading(true);
      const researchData = getResearch();
      const researchId = getResearchMetadata().id;
      await updateResearch(researchId, researchData);
      const publishedResearch = await publishResearch(researchId, { increaseRevision, pauseResearch });
      if (publishedResearch) {
        setResearch(publishedResearch.data, pick(publishedResearch, ['id', 'publishedUrl', 'publishedRevision']));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!publishedUrl) return;
    void navigator.clipboard.writeText(publishedUrl);
  };

  return (
    <section className={classes.wrapper}>
      <Typography variant="h6" sx={{ textAlign: 'center', marginBottom: 2 }}>
        {publishedUrl ? 'Опрос опубликован' : 'Опрос не был опубликован'}
      </Typography>

      <div className={classes.content}>
        <div className={classes.row}>
          <Typography variant="body1" fontWeight="bold" sx={{ width: '100%', marginBottom: 1 }}>
            Отправьте ссылку респондентам:
          </Typography>

          <TextField
            size="small"
            placeholder="Ссылка появится после публикации"
            sx={{ borderRadius: 4, padding: 0, flexGrow: 1 }}
            className={classes.urlField}
            InputProps={{ readOnly: true }}
            value={publishedUrl}
          />

          <Button
            size="small"
            type="button"
            sx={{ borderRadius: 2, flexShrink: 0, marginLeft: 1 }}
            startIcon={<LinkIcon />}
            variant="contained"
            onClick={handleCopyLink}
            disabled={!publishedUrl}
            disableElevation
            disableRipple
          >
            Копировать
          </Button>
        </div>

        <Divider />

        <div className={classes.row}>
          <div className={classes.control}>
            <Typography variant="body1">Прекратить сбор ответов</Typography>

            <Switch checked={pauseResearch} onChange={(event) => setPauseResearch(event.target.checked)} />
          </div>

          <Typography variant="body2" color="action.active">
            После публикации опроса с этой опцией респонденты не смогут пройти исследование.
          </Typography>
        </div>

        <Divider />

        <div className={classes.row}>
          <div className={classes.control}>
            <Typography variant="body1">Отделить статистику</Typography>

            <Switch checked={increaseRevision} onChange={(event) => setIncreaseRevision(event.target.checked)} />
          </div>

          <Typography variant="body2" color="action.active">
            После публикации опроса с этой опцией сбор ответов пойдет с начала. Предыдущие ответы не будут отображаться в
            результатах.
          </Typography>
        </div>

        <div className={classes.publishButtonWrapper}>
          <Button
            type="button"
            variant="contained"
            sx={{ borderRadius: 2.5, marginTop: 2, marginLeft: 'auto' }}
            onClick={saveAndPublish}
            disableElevation
          >
            {isLoading && (
              <span className={classes.loader}>
                <CircularProgress sx={{ color: 'white' }} size={16} />
              </span>
            )}
            <span style={{ visibility: isLoading ? 'hidden' : 'visible' }}>Опубликовать</span>
          </Button>
        </div>
      </div>
    </section>
  );
};
