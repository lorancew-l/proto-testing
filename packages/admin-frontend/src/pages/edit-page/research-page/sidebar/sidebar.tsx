import { Skeleton } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  sidebarCommon: {
    borderRadius: theme.shape.borderRadius * 4,
    height: '100%',
    width: 300,
    position: 'sticky',
    top: 0,
  },
  sidebarLoaded: {
    border: '1px solid #d5d6da',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.common.white,
  },
}));

export const Sidebar = ({
  children,
  isLoading,
  onClick,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  onClick?: (event: React.SyntheticEvent) => void;
}) => {
  const { classes, cx } = useStyles();

  if (isLoading) return <Skeleton sx={{ transform: 'none' }} className={classes.sidebarCommon} />;

  return (
    <aside className={cx(classes.sidebarCommon, classes.sidebarLoaded)} onClick={onClick}>
      {children}
    </aside>
  );
};
