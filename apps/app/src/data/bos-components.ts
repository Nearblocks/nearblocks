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
  transaction: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Transactions.List`,
  blocks: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Blocks.List`,
  latestBlocks: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Blocks.Latest`,
  latestTransactions: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Transactions.Latest`,
  transactionOverview: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Transactions.Overview`,
};

export const componentsByNetworkId: Record<
  NetworkId,
  NetworkComponents | undefined
> = {
  testnet: ComponentUrl,

  mainnet: ComponentUrl,
};
