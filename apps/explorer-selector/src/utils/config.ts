import type { GetServerSideProps } from 'next';

import { NetworkId } from './types';

export type NetworkProps = { network: NetworkId };

// Read per request so one image serves both networks (set by k8s env).
export const getNetworkId = (): NetworkId =>
  process.env.NEXT_PUBLIC_NETWORK_ID === 'mainnet' ? 'mainnet' : 'testnet';

export const networkProps: GetServerSideProps<NetworkProps> = async () => ({
  props: { network: getNetworkId() },
});
