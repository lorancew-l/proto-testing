import { useForm } from 'react-hook-form';
import { Location, useLocation, useNavigate } from 'react-router';
import { Link as RRLink } from 'react-router-dom';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Avatar, Button, Grid, Link, Paper, TextField, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

import { makeStyles } from 'tss-react/mui';

import { SignUpUser, TokenResponse, useSignUpRequest } from '../../api';
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

export const SignUpPage = () => {
  const { classes } = useStyles();

  const { register, handleSubmit, setError, formState } = useForm<SignUpUser & { inviteId?: string }>({
    mode: 'onBlur',
    shouldUseNativeValidation: false,
    reValidateMode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      email: '',
    },
  });

  const location = useLocation() as Location<AuthStateLocation>;
  const navigate = useNavigate();

  const { errors } = formState;

  const { setTokens } = useAuthContext();

  const { signUpUser, isLoading } = useSignUpRequest({
    onSuccess: (tokens: TokenResponse) => {
      setTokens(tokens);
      navigate(location.state?.from ?? '/');
    },
    onError: (error) => {
      if (error === 'Account with this email already exists') {
        setError('email', { message: 'Этот email уже занят' });
      }
    },
  });

  return (
    <div className={classes.background}>
      <form onSubmit={handleSubmit(signUpUser)} noValidate>
        <Paper className={classes.container} elevation={3}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>

          <Typography className={classes.title} component="h1" variant="h5">
            Регистрация
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('firstName', { required: 'Обязательное поле' })}
                helperText={errors.firstName?.message}
                error={!!errors.firstName}
                label="Имя"
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                {...register('lastName', { required: 'Обязательное поле' })}
                helperText={errors.lastName?.message}
                error={!!errors.lastName}
                label="Фамилия"
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register('email', { required: 'Обязательное поле' })}
                helperText={errors.email?.message}
                error={!!errors.email}
                label="Email"
                type="email"
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register('password', { required: 'Обязательное поле' })}
                helperText={errors.password?.message}
                error={!!errors.password}
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
            Зарегистрироваться
          </Button>

          <Link component={RRLink} to="/signin" variant="body2" state={location.state}>
            Уже есть аккаунт? Войдите
          </Link>
        </Paper>
      </form>
    </div>
  );
};
