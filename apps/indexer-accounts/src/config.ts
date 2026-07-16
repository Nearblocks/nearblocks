import { cleanEnv, num, str, url } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  ACCOUNTS_START_BLOCK: num({ default: 0 }),
  BACKFILL_WINDOW_SIZE: str({ default: '60000000000000' }), // 1m in ns
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  NEARDATA_CONCURRENCY: str({ default: 'auto' }),
  NEARDATA_URL: url(),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  SENTRY_DSN: str({ default: '' }),
});

const genesisHeight = env.NETWORK === Network.MAINNET ? 9_820_210 : 42_376_888;
const genesisTimestamp =
  env.NETWORK === Network.MAINNET
    ? '1595350551591948000'
    : '1596166782911378000';
const genesisFile =
  env.NETWORK === Network.MAINNET
    ? `https://s3-us-west-1.amazonaws.com/build.nearprotocol.com/nearcore-deploy/mainnet/genesis.json`
    : `https://s3-us-west-1.amazonaws.com/build.nearprotocol.com/nearcore-deploy/testnet/genesis.json.xz`;

const config: Config = {
  backfillWindowSize: BigInt(env.BACKFILL_WINDOW_SIZE),
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbSchema: 'rebuild',
  dbUrl: env.DATABASE_URL,
  genesisFile,
  genesisHeight,
  genesisTimestamp,
  insertLimit: 2500,
  neardataConcurrency:
    env.NEARDATA_CONCURRENCY === 'auto'
      ? 'auto'
      : Number(env.NEARDATA_CONCURRENCY),
  neardataUrl: env.NEARDATA_URL,
  network: env.NETWORK,
  sentryDsn: env.SENTRY_DSN,
  startBlockHeight: env.ACCOUNTS_START_BLOCK,
};

export default config;
