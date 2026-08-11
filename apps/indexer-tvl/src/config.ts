import { cleanEnv, str } from 'envalid';

import { Network } from 'nb-types';

import { EvmChains } from '#types/enum';
import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  ARBITRUM_ARCHIVE_RPC_URL: str(),
  BASE_ARCHIVE_RPC_URL: str(),
  BSC_ARCHIVE_RPC_URL: str(),
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  ETHEREUM_ARCHIVE_RPC_URL: str(),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  POLYGON_ARCHIVE_RPC_URL: str(),
  SENTRY_DSN: str({ default: '' }),
  SOLANA_ARCHIVE_RPC_URL: str(),
});

const CHUNK_BLOCKS = 2_000;
const CHUNK_DELAY_MS = 3_000;

const config: Config = {
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  evm: {
    [EvmChains.ARBITRUM]: {
      chunkDelayMs: CHUNK_DELAY_MS,
      logChunkBlocks: CHUNK_BLOCKS,
      url: env.ARBITRUM_ARCHIVE_RPC_URL,
    },
    [EvmChains.BASE]: {
      chunkDelayMs: CHUNK_DELAY_MS,
      logChunkBlocks: CHUNK_BLOCKS,
      url: env.BASE_ARCHIVE_RPC_URL,
    },
    [EvmChains.BSC]: {
      chunkDelayMs: CHUNK_DELAY_MS,
      logChunkBlocks: CHUNK_BLOCKS,
      url: env.BSC_ARCHIVE_RPC_URL,
    },
    [EvmChains.ETHEREUM]: {
      chunkDelayMs: CHUNK_DELAY_MS,
      logChunkBlocks: CHUNK_BLOCKS,
      url: env.ETHEREUM_ARCHIVE_RPC_URL,
    },
    [EvmChains.POLYGON]: {
      chunkDelayMs: CHUNK_DELAY_MS,
      logChunkBlocks: CHUNK_BLOCKS,
      url: env.POLYGON_ARCHIVE_RPC_URL,
    },
  },
  intervalMs: 60_000,
  network: env.NETWORK,
  sentryDsn: env.SENTRY_DSN,
  snapshotDayDelayMs: 3000,
  solanaPageDelayMs: 1000,
  solanaTxDelayMs: 1500,
  solanaUrl: env.SOLANA_ARCHIVE_RPC_URL,
};

export default config;
