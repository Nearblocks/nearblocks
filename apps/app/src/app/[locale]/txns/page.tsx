import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import ErrorMessage from '@/components/app/common/ErrorMessage';
import FaInbox from '@/components/app/Icons/FaInbox';
import ListSkeletion from '@/components/app/skeleton/txns/List';
import List from '@/components/app/Transactions/List';

export default async function TransactionList(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    cursor?: string;
    from?: string;
    method?: string;
    order: string;
    page?: string;
    to?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { locale } = params;
  const { cursor, page, ...rest } = searchParams;

  const t = await getTranslations({ locale });

  const errorBoundaryFallback = (
    <>
      <div className="overflow-x-auto">
        <div className="bg-white dark:bg-black-600 drak:border-black-200 border soft-shadow rounded-xl pb-1 ">
          <div className="pl-6 max-w-lg w-full py-5 ">
            <div className="pl-6 max-w-sm leading-7 h-4" />
          </div>
          <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200 border-t">
            <tbody className="bg-white dark:bg-black-600 divide-y dark:divide-black-200 divide-gray-200">
              <tr className="h-[57px]">
                <td
                  className="px-6 py-4 text-gray-400 text-xs rounded-b-xl"
                  colSpan={100}
                >
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
      </div>
    </>
  );

  return (
    <>
      <div className="h-72">
        <div className="container-xxl mx-auto px-5">
          <h1
            className="mb-4 pt-8 sm:!text-2xl text-xl dark:text-neargray-25 font-medium"
            suppressHydrationWarning={true}
          >
            {t('txnsHeading') || 'Latest Near Protocol Transactions'}
          </h1>
        </div>
      </div>
      <div className="container-xxl mx-auto px-5 -mt-48">
        <div className="relative block lg:flex lg:space-x-2">
          <div className=" w-full">
            <ErrorBoundary fallback={errorBoundaryFallback}>
              <Suspense fallback={<ListSkeletion />} key={JSON.stringify(rest)}>
                <List searchParams={searchParams} />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
}
