import AccessKeyTabSkeleton from '@/components/app/skeleton/address/accessKeyTab';
import MultichaintxnsSkeleton from '@/components/app/skeleton/address/multichainTxnsTab';
import NftTokenTxnsSkeleton from '@/components/app/skeleton/address/nftTokenTxns';
import OverviewActionsSkeleton from '@/components/app/skeleton/address/overview';
import TokenTxnsSkeleton from '@/components/app/skeleton/address/tokenTransaction';
import TransactionSkeleton from '@/components/app/skeleton/address/transaction';
import AnalyticsTabSkeltton from '@/components/app/skeleton/address/AnalyticsTab';

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
    case 'analytics':
      return <AnalyticsTabSkeltton />;
    case 'accesskeys':
      return <AccessKeyTabSkeleton />;
    case 'contract':
      return <OverviewActionsSkeleton />;
    case 'multichaintxns':
      return <MultichaintxnsSkeleton />;
    default:
      return <TransactionSkeleton />;
  }
}
