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
  (env('NEXT_PUBLIC_BOS_NETWORK') as NetworkId) || 'testnet';
export const network = networks[networkId];
