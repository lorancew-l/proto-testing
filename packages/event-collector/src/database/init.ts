import { ClickHouseClient, createClient } from '@clickhouse/client';

const getEnvVariable = (name: string): string => {
  const variableValue = process.env[name];
  if (!variableValue) throw new Error(`Missing ${name} .env variable`);
  return variableValue;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForReadiness = async (client: ClickHouseClient) => {
  let isHealthy = false;
  const maxRetries = 20;
  let attempts = 0;

  while (!isHealthy && attempts < maxRetries) {
    try {
      await client.ping();
      isHealthy = true;
      console.log('ClickHouse is up');
    } catch (err) {
      attempts++;
      console.log(`ClickHouse not ready yet... retrying (${attempts}/${maxRetries})`);
      await sleep(1000);
    }
  }

  if (!isHealthy) {
    console.error('ClickHouse did not become ready in time');
    process.exit(1);
  }
};

void (async () => {
  const client = createClient({
    url: getEnvVariable('CLICKHOUSE_URL'),
    username: getEnvVariable('CLICKHOUSE_USER'),
    password: getEnvVariable('CLICKHOUSE_PASSWORD'),
    database: getEnvVariable('CLICKHOUSE_DB'),
  });

  await waitForReadiness(client);

  await client.command({
    query: `
      CREATE TABLE IF NOT EXISTS research_events
      (
        research_id String,
        session_id String,
        ts DateTime,
        type String,
        question_id String,
        question_type String,
        answers String,
        revision UInt16
      ) ENGINE = MergeTree()
      ORDER BY session_id;
    `,
  });

  console.error('ClickHouse successfully migrated');
  await client.close();
})();
