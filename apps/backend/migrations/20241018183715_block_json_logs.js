import { upSQL } from 'knex-migrate-sql-file';

export async function up(knex) {
  await upSQL(knex);
}

export function down() {}
