import { Suspense } from 'react';

import AccessKeys from '@/components/app/Address/AccessKeys';
import Overview from '@/components/app/Address/Contract/Overview';
import NFTTransactions from '@/components/app/Address/NFTTransactions';
import Receipts from '@/components/app/Address/Receipts';
import TokenTransactions from '@/components/app/Address/TokenTransactions';
import Transactions from '@/components/app/Address/Transactions';
import TabPanelGeneralSkeleton from '@/components/app/skeleton/address/dynamicTab';
import { getRequest } from '@/utils/app/api';

import AccountTabsActions from './AccountTabsActions';
import MultiChainTransactions from './ChainTxns';

export default async function AccountTabs({
  id,
  searchParams,
}: {
  id: string;
  searchParams: any;
}) {
  const options: RequestInit = {
    next: { revalidate: 10 },
  };
  const parse =
    (await getRequest(`account/${id}/contract/parse`, {}, options)) || {};
  const tab = searchParams?.tab || 'txns';

  return (
    <AccountTabsActions id={id} parse={parse} searchParams={searchParams}>
      <Suspense fallback={<TabPanelGeneralSkeleton tab={tab} />}>
        {tab === 'txns' ? (
          <Transactions id={id} searchParams={searchParams} />
        ) : null}

        {tab === 'receipts' ? (
          <Receipts id={id} searchParams={searchParams} />
        ) : null}

        {tab === 'tokentxns' ? (
          <TokenTransactions id={id} searchParams={searchParams} />
        ) : null}

        {tab === 'nfttokentxns' ? (
          <NFTTransactions id={id} searchParams={searchParams} />
        ) : null}

        {tab === 'multichaintxns' ? (
          <MultiChainTransactions id={id} searchParams={searchParams} />
        ) : null}

        {tab === 'accesskeys' ? (
          <AccessKeys id={id} searchParams={searchParams} />
        ) : null}

        {tab === 'contract' ? (
          <Overview id={id} searchParams={searchParams} />
        ) : null}
      </Suspense>
    </AccountTabsActions>
  );
}
