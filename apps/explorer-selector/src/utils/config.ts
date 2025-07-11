import { env } from 'next-runtime-env';
import { NetworkId } from './types';

export const getNetworkId = (): NetworkId => {
  return (env('NEXT_PUBLIC_NETWORK_ID') as NetworkId) || 'testnet';
};
