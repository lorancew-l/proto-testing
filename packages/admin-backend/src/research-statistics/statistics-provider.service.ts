import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ClickHouseClient, createClient } from '@clickhouse/client';

@Injectable()
export class StatisticsProviderService {
  public query: ClickHouseClient['query'];
  public insert: ClickHouseClient['insert'];

  constructor(readonly configService: ConfigService) {
    const url = configService.get('CLICKHOUSE_URL');
    const username = configService.get('CLICKHOUSE_USER');
    const database = configService.get('CLICKHOUSE_DB');
    const password = configService.get('CLICKHOUSE_PASSWORD');

    const client = createClient({
      url,
      username,
      password,
      database,
    });

    this.query = client.query.bind(client);
    this.insert = client.insert.bind(client);
  }
}
