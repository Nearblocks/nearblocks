import { cleanEnv, num, str } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  ARBITRUM_RPC_URL: str({ default: '' }),
  ARBITRUM_START_BLOCK: num({ default: 0 }),
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
      interval: 1000, // 1s
      start: env.ARBITRUM_START_BLOCK,
      url: env.ARBITRUM_RPC_URL,
    },
    BASE: {
      interval: 5000, // 5s
      start: env.BASE_START_BLOCK,
      url: env.BASE_RPC_URL,
    },
    BITCOIN: {
      interval: env.NETWORK === Network.MAINNET ? 600000 : 300000, // 10m/5m
      start: env.BITCOIN_START_BLOCK,
      url: env.BITCOIN_RPC_URL,
    },
    BSC: {
      interval: 10000, // 10s
      start: env.BSC_START_BLOCK,
      url: env.BSC_RPC_URL,
    },
    ETHEREUM: {
      interval: 10000, // 10s
      start: env.ETHEREUM_START_BLOCK,
      url: env.ETHEREUM_RPC_URL,
    },
    GNOSIS: {
      interval: 10000, // 10s
      start: env.GNOSIS_START_BLOCK,
      url: env.GNOSIS_RPC_URL,
    },
    OPTIMISM: {
      interval: 5000, // 5s
      start: env.OPTIMISM_START_BLOCK,
      url: env.OPTIMISM_RPC_URL,
    },
    POLYGON: {
      interval: 5000, // 5s
      start: env.POLYGON_START_BLOCK,
      url: env.POLYGON_RPC_URL,
    },
    SOLANA: {
      interval: 2000, // 2s
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
