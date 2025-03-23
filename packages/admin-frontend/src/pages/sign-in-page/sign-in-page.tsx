import { useForm } from 'react-hook-form';
import { Location, useLocation, useNavigate } from 'react-router';
import { Link as RRLink } from 'react-router-dom';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Avatar, Button, Grid, Link, Paper, TextField, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

import { makeStyles } from 'tss-react/mui';

import { SignInUser, TokenResponse, useSignInRequest } from '../../api';
import { useAuthContext } from '../../auth-context';

const useStyles = makeStyles()((theme) => ({
  background: {
    paddingTop: theme.spacing(8),
    width: '100vw',
    height: '100dvh',
    maxWidth: '100vw',
    maxHeight: '100dvh',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.default,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: 400,
    padding: theme.spacing(3, 2),
    margin: '0 auto',
    backgroundColor: theme.palette.background.paper,
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
  },
  title: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  button: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
}));

interface AuthStateLocation {
  from?: string;
}

export const SignInPage = () => {
  const { classes } = useStyles();

  const { register, handleSubmit, setError, formState } = useForm<SignInUser>({
    mode: 'onBlur',
    shouldUseNativeValidation: false,
    reValidateMode: 'onChange',
    defaultValues: {
      password: '',
      email: '',
    },
  });

  const { errors } = formState;

  const location = useLocation() as Location<AuthStateLocation>;
  const navigate = useNavigate();

  const { setTokens } = useAuthContext();

  const { signInUser, isLoading } = useSignInRequest({
    onSuccess: (tokens: TokenResponse) => {
      setTokens(tokens);
      navigate(location.state?.from ?? '/');
    },
    onError: (error) => {
      if (error === 'Invalid password or email') {
        setError('email', { message: 'Некорректный email или пароль' });
      }
    },
  });

  return (
    <div className={classes.background}>
      <form onSubmit={handleSubmit(signInUser)} noValidate>
        <Paper className={classes.container} elevation={3}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>

          <Typography className={classes.title} component="h1" variant="h5">
            Вход
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                {...register('email', { required: 'Обязательное поле' })}
                error={!!errors.email}
                helperText={errors.email?.message}
                label="Email"
                type="email"
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register('password', { required: 'Обязательное поле' })}
                error={!!errors.password}
                helperText={errors.password?.message}
                label="Пароль"
                type="password"
                required
                fullWidth
              />
            </Grid>
          </Grid>

          <Button
            startIcon={isLoading ? <CircularProgress color="info" size={16} /> : undefined}
            className={classes.button}
            type="submit"
            variant="contained"
            disabled={isLoading}
            fullWidth
          >
            Войти
          </Button>

          <Link component={RRLink} to="/signup" variant="body2" state={location.state}>
            Нет аккаунта? Зарегистрируйтесь
          </Link>
        </Paper>
      </form>
    </div>
  );
};
