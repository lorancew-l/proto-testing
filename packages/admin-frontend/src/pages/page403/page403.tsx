import { useNavigate } from 'react-router-dom';

import { Button, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  container: {
    width: '100vw',
    height: '100dvh',
    display: 'flex',
    WebkitJustifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    fontSize: '64px',
  },
  button: {
    margin: '0 auto',
    marginTop: theme.spacing(2),
  },
}));

export const Page403 = () => {
  const { classes } = useStyles();

  const navigate = useNavigate();

  const navigateToHomePage = () => navigate('/');

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <Typography variant="h1">403</Typography>

        <Typography variant="h6">Вы не можете просматривать эту страницу</Typography>

        <Button onClick={navigateToHomePage} className={classes.button} variant="contained" color="primary">
          Вернутся на главную
        </Button>
      </div>
    </div>
  );
};
