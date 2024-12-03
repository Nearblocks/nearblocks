import knexPkg from 'knex';

const { knex } = knexPkg;

const defaultConfig: knexPkg.Knex.Config = {
  client: 'pg',
  pool: { max: 10, min: 0 },
};

export type Knex = knexPkg.Knex;
export type KnexConfig = knexPkg.Knex.Config;

export const createKnex = (
  config: knexPkg.Knex.Config | string,
): knexPkg.Knex => {
  const knexConfig: knexPkg.Knex.Config =
    typeof config === 'string'
      ? { ...defaultConfig, connection: config }
      : config;

  return knex(knexConfig);
};
