import { cleanEnv, num, str, url } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  FASTNEAR_API_KEY: str({ default: undefined }),
  NEARDATA_CONCURRENCY: str({ default: 'auto' }),
  NEARDATA_URL: str({ default: undefined }),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  RPC_URL: url({ default: undefined }),
  SENTRY_DSN: str({ default: '' }),
  VERIFY_COOLDOWN_DAYS: num({ default: 30 }),
  VERIFY_DRAW_ATTEMPTS: num({ default: 6 }),
  VERIFY_INTERVAL_MS: num({ default: 60_000 }),
  VERIFY_MAX_ATTEMPTS: num({ default: 5 }),
  VERIFY_MIN_LAG_BLOCKS: num({ default: 100 }),
  VERIFY_SAMPLES: num({ default: 3 }),
  VERIFY_SEED_BATCH: num({ default: 5_000 }),
});

const INDEXER_KEY = 'ft_state';
const VERIFY_KEY = 'ft_state_verify';

const startBlockHeight =
  env.NETWORK === Network.MAINNET ? 30_119_194 : 42_377_765;

const config: Config = {
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  fastnearApiKey: env.FASTNEAR_API_KEY,
  indexerKey: INDEXER_KEY,
  insertLimit: 2500,
  neardataConcurrency:
    env.NEARDATA_CONCURRENCY === 'auto'
      ? 'auto'
      : Number(env.NEARDATA_CONCURRENCY),
  neardataUrl: env.NEARDATA_URL,
  network: env.NETWORK,
  rawLag: 2_000,
  rawThreshold: 5_000,
  rpcUrl: env.RPC_URL,
  sentryDsn: env.SENTRY_DSN,
  startBlockHeight,
  verifyCooldownDays: env.VERIFY_COOLDOWN_DAYS,
  verifyDrawAttempts: env.VERIFY_DRAW_ATTEMPTS,
  verifyIntervalMs: env.VERIFY_INTERVAL_MS,
  verifyKey: VERIFY_KEY,
  verifyMaxAttempts: env.VERIFY_MAX_ATTEMPTS,
  verifyMinLagBlocks: env.VERIFY_MIN_LAG_BLOCKS,
  verifySamples: env.VERIFY_SAMPLES,
  verifySeedBatch: env.VERIFY_SEED_BATCH,
};

export default config;
