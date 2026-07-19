import { readFile } from 'node:fs/promises';

export async function up(knex) {
  const sql = await readFile(
    new URL('./20260719000000_next_seat_price.up.sql', import.meta.url),
    'utf8',
  );

  await knex.raw(sql);
}

export function down() {}
