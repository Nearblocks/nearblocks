import type { NetworkId } from '@/utils/types';
type NetworkComponents = {
  nodeExplorer: string;
  sponsoredText: string;
  account: string;
  blocksList: string;
  blocksLatest: string;
  blocksDetail: string;
  transactionsList: string;
  transactionsLatest: string;
  transactionsOverview: string;
  transactionsHash: string;
  search: string;
  ftList: string;
  charts: string;
};
const ComponentUrl = {
  nodeExplorer: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NodeExplorer`,
  sponsoredText: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Shared.SponsoredText`,
  account: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Accounts`,
  blocksList: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Blocks.List`,
  blocksLatest: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Blocks.Latest`,
  blocksDetail: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Blocks.Detail`,
  transactionsList: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Transactions.List`,
  transactionsLatest: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Transactions.Latest`,
  transactionsOverview: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Transactions.Overview`,
  transactionsHash: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Transactions.Hash`,
  search: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Shared.Search`,
  ftList: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.FT.List`,
  charts: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Charts`,
};
export const componentsByNetworkId: Record<
  NetworkId,
  NetworkComponents | undefined
> = {
  testnet: ComponentUrl,
  mainnet: ComponentUrl,
};
