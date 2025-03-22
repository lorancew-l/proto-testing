import { useEffect, useState } from 'react';

import { User } from '../api';

import { useAuthContext } from './auth-context';

export const useUser = () => {
  const { subscribeUserUpdate, unsubscribeUserUpdate, getUser } = useAuthContext();

  const [user, setUser] = useState<User | null>(getUser);

  useEffect(() => {
    subscribeUserUpdate(setUser);

    return () => unsubscribeUserUpdate(setUser);
  }, []);

  return user;
};
