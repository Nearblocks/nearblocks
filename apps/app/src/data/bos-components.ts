import type { NetworkId } from '@/utils/types';

type NetworkComponents = {
  nodeExplorer: string;
  account: string;
  transaction: string;
  blocks: string;
  homePage: string;
};

export const componentsByNetworkId: Record<
  NetworkId,
  NetworkComponents | undefined
> = {
  testnet: {
    nodeExplorer: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.NodeExplorer`,
    account: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.Accounts`,
    transaction: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.Transactions`,
    blocks: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.Blocks`,
    homePage: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.HomePage`,
  },

  mainnet: {
    nodeExplorer: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.NodeExplorer`,
    account: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.Accounts`,
    transaction: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.Transactions`,
    blocks: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.Blocks`,
    homePage: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.HomePage`,
  },
};
