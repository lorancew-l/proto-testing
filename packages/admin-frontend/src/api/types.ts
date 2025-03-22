export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type TokenPayload = User & { exp: number };

export type SignUpUser = Omit<User, 'id'> & { password: string };

export type SignInUser = Omit<User, 'firstName' | 'lastName'> & { password: string };

export type TokenResponse = { access_token: string; refresh_token: string };
