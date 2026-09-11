import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { PostgreSqlContainer } from '@testcontainers/postgresql';
import knexFactory, { Knex } from 'knex';
import { Client } from 'pg';

const migrationPath = fileURLToPath(
  new URL(
    '../../../indexer-base/migrations/20250711143022_accounts.up.sql',
    import.meta.url,
  ),
);

export const startTestDb = async () => {
  const container = await new PostgreSqlContainer('postgres:17-alpine').start();
  const connectionUri = container.getConnectionUri();

  const client = new Client({ connectionString: connectionUri });

  await client.connect();
  await client.query(readFileSync(migrationPath, 'utf-8'));
  await client.end();

  const db: Knex = knexFactory({
    client: 'pg',
    connection: connectionUri,
    pool: { max: 10, min: 0 },
  });

  return { container, db };
};
