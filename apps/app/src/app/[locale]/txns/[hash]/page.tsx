import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import ErrorMessage from '@/components/app/common/ErrorMessage';
import FileSlash from '@/components/app/Icons/FileSlash';
import TxnsTabsSkeleton from '@/components/app/skeleton/txns/TxnsTabs';
import TxnsTabs from '@/components/app/Transactions/TxnsTabs';

export default async function TxnsHashIndex(props: {
  params: Promise<{ hash: string; locale: string }>;
  searchParams: Promise<{
    cursor?: string;
    order: string;
    p?: string;
    tab: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { hash, locale } = params;

  return (
    <ErrorBoundary
      fallback={
        <>
          <div className="container-xxl mx-auto px-5">
            <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
              <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid dark:divide-black-200 divide-gray-200 !divide-y">
                <ErrorMessage
                  icons={<FileSlash />}
                  message="Sorry, we are unable to locate this transaction hash. Please try again later."
                  mutedText={''}
                  reset
                />
              </div>
            </div>
          </div>
          <div className="py-8"></div>
        </>
      }
    >
      <Suspense
        fallback={
          <TxnsTabsSkeleton hash={hash} tab={searchParams?.tab || 'overview'} />
        }
      >
        <TxnsTabs hash={hash} locale={locale} searchParams={searchParams} />
      </Suspense>
    </ErrorBoundary>
  );
}
