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
  ftTransfersList: string;
  ftOverview: string;
  nftList: string;
  nftOverview: string;
  nftTransfersList: string;
  charts: string;
  exportData: string;
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
  ftTransfersList: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.FT.TransfersList`,
  ftOverview: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.FT.Overview`,
  nftList: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NFT.List`,
  nftOverview: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NFT.Overview`,
  nftTransfersList: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NFT.TransfersList`,
  charts: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.Charts`,
  exportData: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.ExportData`,
};
export const componentsByNetworkId: Record<
  NetworkId,
  NetworkComponents | undefined
> = {
  testnet: ComponentUrl,
  mainnet: ComponentUrl,
};
