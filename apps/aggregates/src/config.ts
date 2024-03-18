import { cleanEnv, str } from 'envalid';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  FT_HOLDERS_TABLE: str({ default: '' }),
  NFT_HOLDERS_TABLE: str({ default: '' }),
  SENTRY_DSN: str({ default: '' }),
});

const config: Config = {
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  ftHoldersTable: env.FT_HOLDERS_TABLE,
  nftHoldersTable: env.NFT_HOLDERS_TABLE,
  sentryDsn: env.SENTRY_DSN,
};

export default config;
