import type { Network, NetworkId } from './types';

export const networks: Record<NetworkId, Network> = {
  mainnet: {
    networkId: 'mainnet',
  },
  testnet: {
    networkId: 'testnet',
  },
};

export const networkId: NetworkId =
  (process.env.NEXT_PUBLIC_NETWORK_ID as NetworkId) || 'testnet';
export const bosNetworkId: NetworkId =
  (process.env.NEXT_PUBLIC_BOS_NETWORK as NetworkId) || 'testnet';

export const network = networks[networkId];

export const apiUrl: string =
  networkId === 'mainnet'
    ? 'https://api3.nearblocks.io/v1/'
    : 'https://api3-testnet.nearblocks.io/v1/';

export const appUrl =
  process.env.NEXT_PUBLIC_NETWORK_ID === 'mainnet'
    ? process.env.NEXT_PUBLIC_MAINNET_URL
    : process.env.NEXT_PUBLIC_TESTNET_URL;
