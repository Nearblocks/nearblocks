import { createKnex, Knex } from 'nb-knex';

import config from '#config';

const knex: Knex = createKnex(config.dbUrl);

export default knex;
