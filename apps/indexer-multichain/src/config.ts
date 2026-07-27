import { cleanEnv, num, str } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  ARBITRUM_RPC_URL: str({ default: '' }),
  ARBITRUM_START_BLOCK: num({ default: 0 }),
  AURORA_RPC_URL: str({ default: '' }),
  AURORA_START_BLOCK: num({ default: 0 }),
  BASE_RPC_URL: str({ default: '' }),
  BASE_START_BLOCK: num({ default: 0 }),
  BITCOIN_RPC_URL: str({ default: '' }),
  BITCOIN_START_BLOCK: num({ default: 0 }),
  BSC_RPC_URL: str({ default: '' }),
  BSC_START_BLOCK: num({ default: 0 }),
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  ETHEREUM_RPC_URL: str({ default: '' }),
  ETHEREUM_START_BLOCK: num({ default: 0 }),
  GNOSIS_RPC_URL: str({ default: '' }),
  GNOSIS_START_BLOCK: num({ default: 0 }),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  OPTIMISM_RPC_URL: str({ default: '' }),
  OPTIMISM_START_BLOCK: num({ default: 0 }),
  POLYGON_RPC_URL: str({ default: '' }),
  POLYGON_START_BLOCK: num({ default: 0 }),
  SENTRY_DSN: str({ default: '' }),
  SOLANA_RPC_URL: str({ default: '' }),
  SOLANA_START_BLOCK: num({ default: 0 }),
});

const config: Config = {
  chains: {
    ARBITRUM: {
      concurrency: 25,
      interval: 250, // 0.25s (measured block time ~0.25s)
      start: env.ARBITRUM_START_BLOCK,
      url: env.ARBITRUM_RPC_URL,
    },
    AURORA: {
      concurrency: 15,
      interval: 500, // 0.5s (measured block time ~0.6s)
      start: env.AURORA_START_BLOCK,
      url: env.AURORA_RPC_URL,
    },
    BASE: {
      concurrency: 15,
      interval: 1000, // 1s (measured block time ~2s)
      start: env.BASE_START_BLOCK,
      url: env.BASE_RPC_URL,
    },
    BITCOIN: {
      concurrency: 5,
      interval: env.NETWORK === Network.MAINNET ? 30000 : 15000, // 30s/15s (measured block time ~10m)
      start: env.BITCOIN_START_BLOCK,
      url: env.BITCOIN_RPC_URL,
    },
    BSC: {
      concurrency: 25,
      interval: 400, // 0.4s (measured block time ~0.45s)
      start: env.BSC_START_BLOCK,
      url: env.BSC_RPC_URL,
    },
    ETHEREUM: {
      concurrency: 10,
      interval: 3000, // 3s (measured block time ~12s)
      start: env.ETHEREUM_START_BLOCK,
      url: env.ETHEREUM_RPC_URL,
    },
    GNOSIS: {
      concurrency: 10,
      interval: 2000, // 2s (measured block time ~5s)
      start: env.GNOSIS_START_BLOCK,
      url: env.GNOSIS_RPC_URL,
    },
    OPTIMISM: {
      concurrency: 15,
      interval: 1000, // 1s (measured block time ~2s)
      start: env.OPTIMISM_START_BLOCK,
      url: env.OPTIMISM_RPC_URL,
    },
    POLYGON: {
      concurrency: 15,
      interval: 1000, // 1s (measured block time ~1.5s)
      start: env.POLYGON_START_BLOCK,
      url: env.POLYGON_RPC_URL,
    },
    SOLANA: {
      concurrency: 30,
      interval: 400, // 0.4s (measured slot time ~0.43s)
      start: env.SOLANA_START_BLOCK,
      url: env.SOLANA_RPC_URL,
    },
  },
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  insertLimit: 2500,
  network: env.NETWORK,
  sentryDsn: env.SENTRY_DSN,
};

export default config;
