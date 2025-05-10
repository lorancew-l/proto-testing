import { Navigate, Outlet, Route, RouterProvider, Routes, createBrowserRouter, useLocation, useNavigate } from 'react-router-dom';

import { StyledEngineProvider, ThemeProvider, createTheme } from '@mui/material/styles';

import { AuthContextProvider, useAuthContext } from './auth-context';
import { MainPage, Page403, ResearchPage, SignInPage, SignUpPage } from './pages';

export const RequireAuth = () => {
  const { getUser } = useAuthContext();
  const location = useLocation();

  if (!getUser()) {
    return <Navigate to="/signin" state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return <Outlet />;
};

export const Routing = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const redirectToSignIn = () => navigate('/signin', { state: { from: `${location.pathname}${location.search}` } });

  return (
    <AuthContextProvider onRefreshFail={redirectToSignIn}>
      <RouteList />
    </AuthContextProvider>
  );
};

const RouteList = () => {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route index path="/" element={<Navigate to="/researches" />} />
      </Route>

      <Route path="/researches" element={<MainPage />} />
      <Route path="/researches/:id" element={<ResearchPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/403" element={<Page403 />} />
    </Routes>
  );
};

const router = createBrowserRouter([{ path: '*', element: <Routing /> }]);

const theme = createTheme({
  typography: {
    fontFamily: ['Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
    fontSize: 14,
  },
});

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <StyledEngineProvider injectFirst>
        <RouterProvider router={router} />
      </StyledEngineProvider>
    </ThemeProvider>
  );
};
