import type { NetworkId } from '@/utils/types';
import { env } from 'next-runtime-env';
type NetworkComponents = {
  nodeExplorer: string;
  delegators: string;
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
  nftDetail: string;
  charts: string;
  exportData: string;
  buttons: string;
  tpsChart: string;
};
const accountId = env('NEXT_PUBLIC_ACCOUNT_ID');

const ComponentUrl = {
  nodeExplorer: `${accountId}/widget/bos-components.components.NodeExplorer`,
  delegators: `${accountId}/widget/bos-components.components.Delegators`,
  sponsoredText: `${accountId}/widget/bos-components.components.Shared.SponsoredText`,
  account: `${accountId}/widget/bos-components.components.Accounts`,
  blocksList: `${accountId}/widget/bos-components.components.Blocks.List`,
  blocksLatest: `${accountId}/widget/bos-components.components.Blocks.Latest`,
  blocksDetail: `${accountId}/widget/bos-components.components.Blocks.Detail`,
  transactionsList: `${accountId}/widget/bos-components.components.Transactions.List`,
  transactionsLatest: `${accountId}/widget/bos-components.components.Transactions.Latest`,
  transactionsOverview: `${accountId}/widget/bos-components.components.Transactions.Overview`,
  transactionsHash: `${accountId}/widget/bos-components.components.Transactions.Hash`,
  search: `${accountId}/widget/bos-components.components.Shared.Search`,
  ftList: `${accountId}/widget/bos-components.components.FT.List`,
  ftTransfersList: `${accountId}/widget/bos-components.components.FT.TransfersList`,
  ftOverview: `${accountId}/widget/bos-components.components.FT.Overview`,
  nftList: `${accountId}/widget/bos-components.components.NFT.List`,
  nftOverview: `${accountId}/widget/bos-components.components.NFT.Overview`,
  nftTransfersList: `${accountId}/widget/bos-components.components.NFT.TransfersList`,
  nftDetail: `${accountId}/widget/bos-components.components.NFT.Detail`,
  charts: `${accountId}/widget/bos-components.components.Charts`,
  exportData: `${accountId}/widget/bos-components.components.ExportData`,
  buttons: `${accountId}/widget/bos-components.components.Shared.Buttons`,
  tpsChart: `${accountId}/widget/bos-components.components.Transactions.TpsChart`,
};
export const componentsByNetworkId: Record<
  NetworkId,
  NetworkComponents | undefined
> = {
  testnet: ComponentUrl,
  mainnet: ComponentUrl,
};
