import AccessKeyTabSkeleton from './accessKeyTab';
import NftTokenTxnsSkeleton from './nftTokenTxns';
import OverviewActionsSkeleton from './overview';
import TokenTxnsSkeleton from './tokenTransaction';
import TransactionSkeleton from './transaction';

interface TabPanelGeneralSkeletonProps {
  tab: string;
}

export default function TabPanelGeneralSkeleton({
  tab,
}: TabPanelGeneralSkeletonProps) {
  switch (tab) {
    case 'txns':
      return <TransactionSkeleton />;
    case 'receipts':
      return <TransactionSkeleton />;
    case 'tokentxns':
      return <TokenTxnsSkeleton />;
    case 'nfttokentxns':
      return <NftTokenTxnsSkeleton />;
    case 'accesskeys':
      return <AccessKeyTabSkeleton />;
    case 'contract':
      return <OverviewActionsSkeleton />;
    default:
      return <TransactionSkeleton />;
  }
}
