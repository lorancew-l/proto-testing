import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { range } from 'lodash';

import AddIcon from '@mui/icons-material/Add';
import { CircularProgress, Skeleton, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { useCreateResearchRequest, useGetResearchListRequest } from '../../api';

const useStyles = makeStyles()((theme) => ({
  container: {
    margin: `${theme.spacing(6)} auto`,
    height: `calc(100vh - 2 * ${theme.spacing(6)})`,
    maxWidth: 'max(60vw, 900px)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  columns: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  column: {
    color: theme.palette.action.active,
    flexBasis: 'calc((100% - 40%) / 3)',
    '&:first-child': {
      marginLeft: '40%',
    },
  },
  researchList: {
    all: 'unset',
    appearance: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    maxHeight: `calc(100vh - 113px - ${theme.spacing(6)})`,
    overflow: 'auto',
  },
  research: {
    listStyle: 'none',
    appearance: 'none',
    height: 44,
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: theme.palette.common.white,
    border: '1px solid #d5d6da',
    padding: theme.spacing(1.5),
  },
  createResearch: {
    all: 'unset',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.shape.borderRadius * 2,
    border: '1px solid #d5d6da',
    padding: theme.spacing(0.5, 1),
    position: 'relative',
    '&:hover': {
      opacity: 0.7,
    },
    '& > *': {
      display: 'flex',
      alignItems: 'center',
    },
  },
  loader: {
    display: 'block',
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%,-50%) !important',
    color: theme.palette.common.black,
  },
}));

export const MainPage = () => {
  const { classes } = useStyles();

  const navigate = useNavigate();
  const { isLoading: isListLoading, data: researchList, getResearchList } = useGetResearchListRequest();
  const { isLoading: isCreateLoading, createResearch } = useCreateResearchRequest({
    onSuccess: ({ id }) => {
      navigate(`/researches/${id}`);
    },
  });

  useEffect(() => {
    getResearchList();
  }, []);

  return (
    <section className={classes.container}>
      <header className={classes.header}>
        <div className={classes.title}>
          <Typography variant="h6">Исследования</Typography>

          <button className={classes.createResearch} disabled={isCreateLoading} onClick={createResearch}>
            {isCreateLoading && <CircularProgress className={classes.loader} size={16} />}

            <span {...(isCreateLoading && { style: { visibility: 'hidden' } })}>
              <AddIcon />
              Создать исследование
            </span>
          </button>
        </div>

        <div className={classes.columns}>
          <Typography className={classes.column} variant="body1">
            Прохождений
          </Typography>
          <Typography className={classes.column} variant="body1">
            Обновлено
          </Typography>
          <Typography className={classes.column} variant="body1">
            Опубликовано
          </Typography>
        </div>
      </header>

      <ol className={classes.researchList}>
        {isListLoading
          ? range(8).map((index) => <Skeleton key={index} height={44} />)
          : researchList?.map((research) => (
              <li key={research.id} className={classes.research}>
                {research.id}
              </li>
            ))}
      </ol>
    </section>
  );
};
