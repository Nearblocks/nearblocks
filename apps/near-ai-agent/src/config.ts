import { cleanEnv, str } from 'envalid';
import { Config } from './types/types';
import { Network } from '../packages/nb-types/src/index.js';

export const networks: Record<NetworkId, Network> = {
  mainnet: {
    networkId: 'mainnet',
  },
  testnet: {
    networkId: 'testnet',
  },
};

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

export const chainAbstractionExplorerUrl =
  networkId === 'mainnet'
    ? {
        ethereum: {
          address: (address: string) =>
            `https://etherscan.io/address/${address}`,
          transaction: (hash: string) => `https://etherscan.io/tx/${hash}`,
        },
        bitcoin: {
          address: (address: string) =>
            `https://blockchain.com/explorer/addresses/btc/${address}`,
          transaction: (hash: string) =>
            `https://www.blockchain.com/explorer/transactions/btc/${hash}`,
        },
        arbitrum: {
          address: (address: string) =>
            `https://arbiscan.io/address/${address}`,
          transaction: (hash: string) => `https://arbiscan.io/tx/${hash}`,
        },
        solana: {
          address: (address: string) =>
            `https://explorer.solana.com/address/${address}`,
          transaction: (hash: string) =>
            `https://explorer.solana.com/tx/${hash}`,
        },
        base: {
          address: (address: string) =>
            `https://basescan.org/address/${address}`,
          transaction: (hash: string) => `https://basescan.org/tx/${hash}`,
        },
        doge: {
          address: (address: string) =>
            `https://dogechain.info/address/${address}`,
          transaction: (hash: string) => `https://dogechain.info/tx/${hash}`,
        },
        xrp: {
          address: (address: string) =>
            `https://xrpscan.com/account/${address}`,
          transaction: (hash: string) => `https://xrpscan.com/tx/${hash}`,
        },
      }
    : {
        ethereum: {
          address: (address: string) =>
            `https://sepolia.etherscan.io/address/${address}`,
          transaction: (hash: string) =>
            `https://sepolia.etherscan.io/tx/${hash}`,
        },
        bitcoin: {
          address: (address: string) =>
            `https://blockexplorer.one/bitcoin/testnet/address/${address}`,
          transaction: (hash: string) => `${hash}`,
        },
        arbitrum: {
          address: (address: string) =>
            `https://sepolia.arbiscan.io/address/${address}`,
          transaction: (hash: string) => `${hash}`,
        },
        solana: {
          address: (address: string) =>
            `https://explorer.solana.com/address/${address}?cluster=testnet`,
          transaction: (hash: string) => `${hash}`,
        },
        base: {
          address: (address: string) =>
            `https://sepolia.basescan.org/address/${address}`,
          transaction: (hash: string) => `${hash}`,
        },
        doge: {
          address: (address: string) =>
            `https://basescan.org/address/${address}`,
          transaction: (hash: string) => `https://dogechain.info/tx/${hash}`,
        },
        xrp: {
          address: (address: string) =>
            `https://xrpscan.com/account/${address}`,
          transaction: (hash: string) => `https://xrpscan.com/tx/${hash}`,
        },
      };
