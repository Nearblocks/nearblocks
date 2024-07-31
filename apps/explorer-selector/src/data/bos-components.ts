import type { NetworkId } from '@/utils/types';
import { env } from 'next-runtime-env';

const accountId = env('NEXT_PUBLIC_ACCOUNT_ID');
type NetworkComponents = {
  home: string;
};

export const componentsByNetworkId: Record<
  NetworkId,
  NetworkComponents | undefined
> = {
  testnet: {
    home: `${accountId}/widget/bos-components.components.ExplorerSelector`,
  },

  mainnet: {
    home: `${accountId}/widget/bos-components.components.ExplorerSelector`,
  },
};
