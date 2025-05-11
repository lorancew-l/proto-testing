import type { Research as ResearchData } from 'shared';

export type { ResearchSuggestionField } from './use-get-research-filter-suggestions';
export type { Session, StatFilter } from './use-get-research-stats-request';
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

export type SavedResearch = {
  id: string;
  name: string;
  data: ResearchData;
  publishedUrl: string | null;
  publishedRevision: number | null;
};
export type PublishedResearch = { id: string; data: ResearchData; revision: number };
