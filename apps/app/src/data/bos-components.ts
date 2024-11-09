import { env } from 'next-runtime-env';

import type { NetworkId } from '@/utils/types';
type NetworkComponents = {
  account: string;
  blocksDetail: string;
  blocksLatest: string;
  blocksList: string;
  buttons: string;
  charts: string;
  commentsFeed: string;
  delegators: string;
  exportData: string;
  ftList: string;
  ftOverview: string;
  ftTransfersList: string;
  nftDetail: string;
  nftList: string;
  nftOverview: string;
  nftTransfersList: string;
  nodeExplorer: string;
  search: string;
  sponsoredText: string;
  tpsChart: string;
  transactionsHash: string;
  transactionsLatest: string;
  transactionsList: string;
  transactionsOverview: string;
};
const accountId = env('NEXT_PUBLIC_ACCOUNT_ID');

const ComponentUrl = {
  account: `${accountId}/widget/bos-components.components.Accounts`,
  blocksDetail: `${accountId}/widget/bos-components.components.Blocks.Detail`,
  blocksLatest: `${accountId}/widget/bos-components.components.Blocks.Latest`,
  blocksList: `${accountId}/widget/bos-components.components.Blocks.List`,
  buttons: `${accountId}/widget/bos-components.components.Shared.Buttons`,
  charts: `${accountId}/widget/bos-components.components.Charts`,
  commentsFeed: `${accountId}/widget/bos-components.components.Comments.Feed`,
  delegators: `${accountId}/widget/bos-components.components.Delegators`,
  exportData: `${accountId}/widget/bos-components.components.ExportData`,
  ftList: `${accountId}/widget/bos-components.components.FT.List`,
  ftOverview: `${accountId}/widget/bos-components.components.FT.Overview`,
  ftTransfersList: `${accountId}/widget/bos-components.components.FT.TransfersList`,
  nftDetail: `${accountId}/widget/bos-components.components.NFT.Detail`,
  nftList: `${accountId}/widget/bos-components.components.NFT.List`,
  nftOverview: `${accountId}/widget/bos-components.components.NFT.Overview`,
  nftTransfersList: `${accountId}/widget/bos-components.components.NFT.TransfersList`,
  nodeExplorer: `${accountId}/widget/bos-components.components.NodeExplorer`,
  search: `${accountId}/widget/bos-components.components.Shared.Search`,
  sponsoredText: `${accountId}/widget/bos-components.components.Shared.SponsoredText`,
  tpsChart: `${accountId}/widget/bos-components.components.Transactions.TpsChart`,
  transactionsHash: `${accountId}/widget/bos-components.components.Transactions.Hash`,
  transactionsLatest: `${accountId}/widget/bos-components.components.Transactions.Latest`,
  transactionsList: `${accountId}/widget/bos-components.components.Transactions.List`,
  transactionsOverview: `${accountId}/widget/bos-components.components.Transactions.Overview`,
};
export const componentsByNetworkId: Record<
  NetworkId,
  NetworkComponents | undefined
> = {
  mainnet: ComponentUrl,
  testnet: ComponentUrl,
};
