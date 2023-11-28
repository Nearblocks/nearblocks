import type { NetworkId } from '@/utils/types';

type NetworkComponents = {
  nodeExplorer: string;
  account: string;
  transaction: string;
};

export const componentsByNetworkId: Record<
  NetworkId,
  NetworkComponents | undefined
> = {
  testnet: {
    nodeExplorer: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.NodeExplorer`,
    account: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.Accounts`,
    transaction: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.Transactions`,
  },

  mainnet: {
    nodeExplorer: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.NodeExplorer`,
    account: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.Accounts`,
    transaction: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.Transactions`,
  },
};
