export async function seed(knex) {
  await knex.raw(`
    INSERT INTO
      api__plans (id, title, limit_per_minute, limit_per_day, limit_per_month, price_monthly, price_annually, created_at, updated_at)
    VALUES (1, 'Free', 6, 333, 10000, 0, 0, now(), now());

    INSERT INTO
      api__plans (id, title, limit_per_minute, limit_per_day, limit_per_month, price_monthly, price_annually, created_at, updated_at)
    VALUES
      (2, 'Hobby', 22, 1333, 40000, 6900, 74520, now(), now());

    INSERT INTO
      api__plans (id, title, limit_per_minute, limit_per_day, limit_per_month, price_monthly, price_annually, created_at, updated_at)
    VALUES
      (3, 'Startup', 67, 4000, 120000, 12900, 139320, now(), now());

    INSERT INTO
      api__plans (id, title, limit_per_minute, limit_per_day, limit_per_month, price_monthly, price_annually, created_at, updated_at)
    VALUES
      (4, 'Standard', 278, 4000, 120000, 29900, 322920, now(), now());

    INSERT INTO
      api__plans (id, title, limit_per_minute, limit_per_day, limit_per_month, price_monthly, price_annually, created_at, updated_at)
    VALUES
      (5, 'Professional', 1667, 100000, 3000000, 69900, 754920, now(), now());
  `);
}
