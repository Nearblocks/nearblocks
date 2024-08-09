import type { Network, NetworkId } from './types';
import { env } from 'next-runtime-env';

export const networks: Record<NetworkId, Network> = {
  mainnet: {
    networkId: 'mainnet',
  },
  testnet: {
    networkId: 'testnet',
  },
};

export const networkId: NetworkId =
  (env('NEXT_PUBLIC_NETWORK_ID') as NetworkId) || 'testnet';
export const bosNetworkId: NetworkId =
  (env('NEXT_PUBLIC_BOS_NETWORK') as NetworkId) || 'testnet';

export const network = networks[networkId];

export const apiUrl: string =
  networkId === 'mainnet'
    ? 'https://api3.nearblocks.io/v1/'
    : 'https://api3-testnet.nearblocks.io/v1/';

export const appUrl =
  env('NEXT_PUBLIC_NETWORK_ID') === 'mainnet'
    ? env('NEXT_PUBLIC_MAINNET_URL')
    : env('NEXT_PUBLIC_TESTNET_URL');

export const docsUrl: string =
  networkId === 'mainnet'
    ? 'https://api3.nearblocks.io/api-docs'
    : 'https://api3-testnet.nearblocks.io/api-docs';

export const userDashboardURL: string =
  env('NEXT_PUBLIC_USER_DASHBOARD_URL') + 'login';

export function getConfig(network: string) {
  switch (network) {
    case 'mainnet':
      return {
        nodeUrl: 'https://rpc.mainnet.near.org',
        backendUrl: 'https://api.nearblocks.io/v1/',
        rpcUrl: 'https://beta.rpc.mainnet.near.org',
        appUrl: 'https://nearblocks.io/',
      };
    case 'testnet':
      return {
        nodeUrl: 'https://rpc.testnet.near.org',
        backendUrl: 'https://api3-testnet.nearblocks.io/v1/',
        rpcUrl: 'https://beta.rpc.testnet.near.org/',
        appUrl: 'https://testnet.nearblocks.io/',
      };
    default:
      return {};
  }
}
