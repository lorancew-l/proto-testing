import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { JwtPayloadWithRefreshToken } from '../types';

export const GetUser = createParamDecorator(
  (data: keyof JwtPayloadWithRefreshToken | undefined, context: ExecutionContext): JwtPayloadWithRefreshToken => {
    const request = context.switchToHttp().getRequest();

    if (!data) {
      return request.user;
    }

    return request.user[data];
  },
);
