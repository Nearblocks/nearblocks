import { createKnex } from 'nb-knex';

import config from '#config';

export default createKnex(config.dbUrl);
