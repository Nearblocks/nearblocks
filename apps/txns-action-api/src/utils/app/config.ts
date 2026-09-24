import { Network, NetworkId } from 'src/types/types';

export const networks: Record<NetworkId, Network> = {
  mainnet: {
    networkId: 'mainnet',
  },
  testnet: {
    networkId: 'testnet',
  },
};

export const networkId: NetworkId =
  (process.env.NETWORK as NetworkId) || 'testnet';

export type ParsedLog = {
  txHash: string;
  networkType: string;
};

export const apiUrl: string =
  process.env.API_URL ||
  (networkId === 'mainnet'
    ? 'https://api.nearblocks.io/'
    : 'https://api-testnet.nearblocks.io/');
