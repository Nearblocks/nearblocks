import AccessKeys from '@/components/app/Address/AccessKeys';
import Overview from '@/components/app/Address/Contract/Overview';
import NFTTransactions from '@/components/app/Address/NFTTransactions';
import Receipts from '@/components/app/Address/Receipts';
import TokenTransactions from '@/components/app/Address/TokenTransactions';
import Transactions from '@/components/app/Address/Transactions';

import AccountTabsActions from '@/components/app/Address/AccountTabsActions';
/* import MultiChainTransactions from './ChainTxns'; */
import TableSummary from '@/components/app/common/TableSummary';
import ErrorMessage from '@/components/app/common/ErrorMessage';
import FaInbox from '@/components/app/Icons/FaInbox';
import { ErrorBoundary } from 'react-error-boundary';

export default async function AccountTabs({
  id,
  searchParams,
}: {
  id: string;
  searchParams: any;
}) {
  const tab = searchParams?.tab || 'txns';
  const fallbackError = (
    <>
      <TableSummary text="" />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200 border-t">
          <tbody className="bg-white dark:bg-black-600 divide-y dark:divide-black-200 divide-gray-200">
            <tr className="h-[57px]">
              <td className="px-6 py-4 text-gray-400 text-xs" colSpan={100}>
                <ErrorMessage
                  icons={<FaInbox />}
                  message={''}
                  mutedText="Please try again later"
                  reset
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <AccountTabsActions>
      {tab === 'txns' ? (
        <ErrorBoundary fallback={fallbackError}>
          <Transactions id={id} searchParams={searchParams} />
        </ErrorBoundary>
      ) : null}

      {tab === 'receipts' ? (
        <ErrorBoundary fallback={fallbackError}>
          <Receipts id={id} searchParams={searchParams} />
        </ErrorBoundary>
      ) : null}

      {tab === 'tokentxns' ? (
        <ErrorBoundary fallback={fallbackError}>
          <TokenTransactions id={id} searchParams={searchParams} />
        </ErrorBoundary>
      ) : null}

      {tab === 'nfttokentxns' ? (
        <ErrorBoundary fallback={fallbackError}>
          <NFTTransactions id={id} searchParams={searchParams} />
        </ErrorBoundary>
      ) : null}

      {/*  {tab === 'multichaintxns' ? (
        <ErrorBoundary fallback={fallbackError}>
          <MultiChainTransactions id={id} searchParams={searchParams} />
        </ErrorBoundary>
      ) : null} */}

      {tab === 'accesskeys' ? (
        <ErrorBoundary fallback={fallbackError}>
          <AccessKeys id={id} searchParams={searchParams} />
        </ErrorBoundary>
      ) : null}

      {tab === 'contract' ? (
        <ErrorBoundary fallback={fallbackError}>
          <Overview id={id} searchParams={searchParams} />
        </ErrorBoundary>
      ) : null}
    </AccountTabsActions>
  );
}
