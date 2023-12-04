import type { NetworkId } from '@/utils/types';

type NetworkComponents = {
  nodeExplorer: string;
  account: string;
  transaction: string;
  blocks: string;
  latestBlocks: string;
  latestTransactions: string;
  transactionOverview: string;
};

const ComponentUrl = {
  nodeExplorer: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NodeExplorer`,
  account: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Accounts`,
  transaction: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Transactions`,
  blocks: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Blocks`,
  latestBlocks: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.LatestBlocks`,
  latestTransactions: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.LatestTransactions`,
  transactionOverview: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.TransactionOverview`,
};

export const componentsByNetworkId: Record<
  NetworkId,
  NetworkComponents | undefined
> = {
  testnet: ComponentUrl,

  mainnet: ComponentUrl,
};
