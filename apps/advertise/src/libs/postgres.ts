import { ConnectionOptions } from 'tls';

import postgres from 'postgres';

import config from '#config';

const ssl: ConnectionOptions = {
  rejectUnauthorized: true,
};

export const userSql = postgres(config.dbUrl, {
  connection: {
    application_name: 'advertise-api',
  },
  max: 60,
  ssl: ssl?.ca ? ssl : false,
});

export default userSql;
