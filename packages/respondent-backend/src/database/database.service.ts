import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaClient } from '.prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient {
  constructor(configService: ConfigService) {
    const user = configService.get('POSTGRES_USER');
    const password = configService.get('POSTGRES_PASSWORD');
    const host = configService.get('POSTGRES_HOST');
    const port = configService.get('POSTGRES_PORT');
    const db = configService.get('POSTGRES_DB');

    super({
      datasources: {
        db: {
          url: `postgresql://${user}:${password}@${host}:${port}/${db}`,
        },
      },
    });
  }
}
