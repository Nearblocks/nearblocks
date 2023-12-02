import type { NetworkId } from '@/utils/types';

type NetworkComponents = {
  nodeExplorer: string;
  account: string;
};

export const componentsByNetworkId: Record<
  NetworkId,
  NetworkComponents | undefined
> = {
  testnet: {
    nodeExplorer: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.NodeExplorer`,
    account: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.Accounts`,
  },

  mainnet: {
    nodeExplorer: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.NodeExplorer`,
    account: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.Accounts`,
  },
};
