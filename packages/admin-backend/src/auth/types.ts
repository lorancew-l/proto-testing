import { User } from '.prisma/client';

export type JwtPayload = User & { iat: number; exp: number };

export type JwtPayloadWithRefreshToken = JwtPayload & { refresh_token: string };
