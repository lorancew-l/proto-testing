import { Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { Sidebar } from '../sidebar';

const useStyles = makeStyles()((theme) => ({
  filterList: {
    padding: theme.spacing(0.25),
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 185px)',
    marginLeft: theme.spacing(-0.25),
  },
}));

export const FilterSidebar = ({ isLoading }: { isLoading: boolean }) => {
  const { classes } = useStyles();

  return (
    <Sidebar isLoading={isLoading}>
      <Typography variant="h6">Фильтры</Typography>

      <ol className={classes.filterList}></ol>
    </Sidebar>
  );
};
