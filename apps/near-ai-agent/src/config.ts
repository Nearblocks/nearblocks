import { cleanEnv, str } from 'envalid';
import { Config } from './types/types';
import { Network } from '../packages/nb-types/src/index.js';

const env = cleanEnv(process.env, {
  API_ACCESS_KEY: str(),
  API_URL: str({ default: 'https://api.nearblocks.io' }),
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  MAINNET_URL: str({ default: 'https://api.nearblocks.io' }),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  SENTRY_DSN: str({ default: '' }),
  TESTNET_URL: str({ default: 'https://api-testnet.nearblocks.io' }),
  USER_DB_URL: str(),
});

const config: Config = {
  port: 3001,
  network: env.NETWORK,
  apiAccessKey: env.API_ACCESS_KEY,
  apiUrl: env.API_URL,
  maxQueryCost: 400000,
  maxQueryRows: 5000,
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  userDbUrl: env.USER_DB_URL,
};

export default config;
