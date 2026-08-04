import { cleanEnv, num, str, url } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  DATABASE_URL_BASE: str(),
  MPC_BACKFILL_WINDOW_SIZE: str({ default: '300000000000' }), // 5m in ns
  NEARDATA_CONCURRENCY: str({ default: 'auto' }),
  NEARDATA_URL: url(),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  RPC_URL: url(),
  SENTRY_DSN: str({ default: '' }),
  SIGNATURE_INDEXER_KEY: str(),
  SIGNATURE_START_BLOCK: num({ default: 0 }),
});

const genesisHeight = env.NETWORK === Network.MAINNET ? 9_820_210 : 42_376_888;
const signerStartTimestamp =
  env.NETWORK === Network.MAINNET
    ? '1722614400000000000'
    : '1721977200000000000';
const signerEndTimestamp = '1785542400000000000';

const config: Config = {
  backfillWindowSize: BigInt(env.MPC_BACKFILL_WINDOW_SIZE),
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  dbUrlBase: env.DATABASE_URL_BASE,
  genesisHeight,
  indexerKey: env.SIGNATURE_INDEXER_KEY,
  insertLimit: 2500,
  neardataConcurrency:
    env.NEARDATA_CONCURRENCY === 'auto'
      ? 'auto'
      : Number(env.NEARDATA_CONCURRENCY),
  neardataUrl: env.NEARDATA_URL,
  network: env.NETWORK,
  rpcUrl: env.RPC_URL,
  sentryDsn: env.SENTRY_DSN,
  signerEndTimestamp,
  signerStartTimestamp,
  startBlockHeight: env.SIGNATURE_START_BLOCK,
};

export default config;
