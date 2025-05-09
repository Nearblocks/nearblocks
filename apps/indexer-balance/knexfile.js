const ssl = {
  rejectUnauthorized: true,
};

if (process.env.DATABASE_CA) {
  ssl.ca = Buffer.from(process.env.DATABASE_CA, 'base64').toString('utf-8');
  ssl.cert = Buffer.from(process.env.DATABASE_CERT, 'base64').toString('utf-8');
  ssl.key = Buffer.from(process.env.DATABASE_KEY, 'base64').toString('utf-8');
}

export default {
  production: {
    client: 'postgresql',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: ssl?.ca ? ssl : false,
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
    pool: { max: 1, min: 0 },
  },
};
