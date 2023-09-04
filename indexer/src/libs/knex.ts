import knexPkg, { Knex } from 'knex';

import config from '#config';

const { knex: createKnex } = knexPkg;
const knexConfig: Knex.Config = {
  client: 'pg',
  connection: config.dbUrl,
  pool: { min: 0, max: 10 },
};

const knex = createKnex(knexConfig);

export default knex;
