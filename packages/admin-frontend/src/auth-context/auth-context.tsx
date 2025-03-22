import { createContext, useContext, useMemo, useRef } from 'react';

import { jwtDecode } from 'jwt-decode';

import { TokenPayload, TokenResponse, User, useRefreshTokens } from '../api';

import { useStorageAuth } from './use-storage-auth';

type AuthContextProviderProps = {
  children: React.ReactNode;
  onRefreshFail: () => void;
};

type UserUpdateSubscriberCb = (user: User | null) => void;

type AuthContextReturn = {
  setTokens(tokens: TokenResponse): void;
  getToken(): Promise<string | null>;
  refreshTokens(): Promise<string | null>;
  getUser(): User | null;
  removeTokens(): void;
  subscribeUserUpdate(cb: UserUpdateSubscriberCb): void;
  unsubscribeUserUpdate(cb: UserUpdateSubscriberCb): void;
};

const AuthContext = createContext({} as AuthContextReturn);

const storageTokensKey = '@prototesting/tokens';

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children, onRefreshFail }) => {
  const { getTokenFromStorage, setTokenToStorage, removeTokenFromStorage } = useStorageAuth(storageTokensKey);

  const subscribers = useRef<UserUpdateSubscriberCb[]>([]);

  const tokens = useRef<TokenResponse | null>(getTokenFromStorage());
  const pendingTokens = useRef<Promise<TokenResponse | null> | null>(null);

  const getUserFromToken = (tokens: TokenResponse | null): User | null => {
    if (!tokens) return null;

    try {
      const { exp, ...userData }: TokenPayload = jwtDecode(tokens?.refresh_token);
      const expDate = new Date(exp * 1000);

      const isExpired = new Date() > expDate;

      if (isExpired) {
        return null;
      }

      return userData;
    } catch {
      return null;
    }
  };

  const user = useRef<User | null>(getUserFromToken(tokens.current));

  const getUser = () => user.current;

  const setTokens = (newTokens: TokenResponse) => {
    user.current = getUserFromToken(newTokens);
    tokens.current = newTokens;
    pendingTokens.current = null;

    setTokenToStorage(newTokens);
    notifySubscribers();
  };

  const { refresh } = useRefreshTokens({
    onSuccess: setTokens,
    onError: onRefreshFail,
  });

  const notifySubscribers = () => {
    const currentUser = getUser();
    subscribers.current.forEach((subscriberCb) => subscriberCb(currentUser));
  };

  const getToken = async () => {
    if (pendingTokens.current) {
      const { access_token } = (await pendingTokens.current) ?? {};
      return access_token ?? null;
    }

    return tokens.current?.access_token ?? null;
  };

  const refreshTokens = async () => {
    if (pendingTokens.current) {
      return getToken();
    }

    const { refresh_token } = tokens.current ?? {};

    if (refresh_token) {
      pendingTokens.current = refresh(refresh_token) ?? null;
    }

    return getToken();
  };

  const removeTokens = () => {
    user.current = null;
    tokens.current = null;
    pendingTokens.current = null;
    removeTokenFromStorage();
    notifySubscribers();
  };

  const subscribeUserUpdate = (cb: UserUpdateSubscriberCb) => subscribers.current.push(cb);

  const unsubscribeUserUpdate = (cb: UserUpdateSubscriberCb) => {
    subscribers.current = subscribers.current.filter((subscriberCb) => subscriberCb !== cb);
  };

  const value = useMemo(
    () => ({
      getUser,
      getToken,
      setTokens,
      removeTokens,
      refreshTokens,
      subscribeUserUpdate,
      unsubscribeUserUpdate,
    }),
    [],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
