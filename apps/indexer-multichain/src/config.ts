import { cleanEnv, str } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  ARBITRUM_RPC_URL: str({ default: '' }),
  BASE_RPC_URL: str({ default: '' }),
  BITCOIN_RPC_URL: str({ default: '' }),
  BSC_RPC_URL: str({ default: '' }),
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  DATABASE_URL_READ: str({ default: '' }),
  ETHEREUM_RPC_URL: str({ default: '' }),
  GNOSIS_RPC_URL: str({ default: '' }),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  OPTIMISM_RPC_URL: str({ default: '' }),
  POLYGON_RPC_URL: str({ default: '' }),
  SENTRY_DSN: str({ default: '' }),
  SOLANA_RPC_URL: str({ default: '' }),
});

const config: Config = {
  chains: {
    ARBITRUM: {
      interval: 1000, // 1s
      start: env.NETWORK === Network.MAINNET ? 235722005 : 66361040,
      url: env.ARBITRUM_RPC_URL,
    },
    BASE: {
      interval: 5000, // 5s
      start: env.NETWORK === Network.MAINNET ? 17538127 : 13048656,
      url: env.BASE_RPC_URL,
    },
    BITCOIN: {
      interval: env.NETWORK === Network.MAINNET ? 600000 : 300000, // 10m/5m
      start: env.NETWORK === Network.MAINNET ? 853779 : 2869965,
      url: env.BITCOIN_RPC_URL,
    },
    BSC: {
      interval: 10000, // 10s
      start: env.NETWORK === Network.MAINNET ? 40766572 : 42381856,
      url: env.BSC_RPC_URL,
    },
    ETHEREUM: {
      interval: 10000, // 10s
      start: env.NETWORK === Network.MAINNET ? 20379839 : 6370346,
      url: env.ETHEREUM_RPC_URL,
    },
    GNOSIS: {
      interval: 10000, // 10s
      start: env.NETWORK === Network.MAINNET ? 35136644 : 1035904,
      url: env.GNOSIS_RPC_URL,
    },
    OPTIMISM: {
      interval: 5000, // 5s
      start: env.NETWORK === Network.MAINNET ? 123133412 : 15031530,
      url: env.OPTIMISM_RPC_URL,
    },
    POLYGON: {
      interval: 5000, // 5s
      start: env.NETWORK === Network.MAINNET ? 59770449 : 9892923,
      url: env.POLYGON_RPC_URL,
    },
    SOLANA: {
      interval: 2000, // 2s
      start: env.NETWORK === Network.MAINNET ? 279492479 : 314013232,
      url: env.SOLANA_RPC_URL,
    },
  },
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  dbUrlRead: env.DATABASE_URL_READ,
  insertLimit: 2500,
  network: env.NETWORK,
  sentryDsn: env.SENTRY_DSN,
};

export default config;
