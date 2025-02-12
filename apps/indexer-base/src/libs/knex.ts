import { createKnex, Knex } from 'nb-knex';

import config from '#config';

const knex: Knex = createKnex({
  client: 'pg',
  connection: {
    connectionString: config.dbUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  },
  pool: { max: 10, min: 1 },
});

export default knex;
