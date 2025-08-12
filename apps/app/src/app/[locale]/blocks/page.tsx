import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import ErrorMessage from '@/components/app/common/ErrorMessage';
import FaInbox from '@/components/app/Icons/FaInbox';
import ListSkeleton from '@/components/app/skeleton/blocks/list';
import { BlocksReq } from 'nb-schemas';
import ListActions from '@/components/app/Blocks/ListActions';
import { getRequestBeta } from '@/utils/app/api';

export default async function Blocks(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<BlocksReq>;
}) {
  const searchParams = await props.searchParams;

  const { cursor } = searchParams;

  const params = await props.params;

  const { locale } = params;

  const t = await getTranslations({ locale });

  const errorBoundaryFallback = (
    <>
      <div className="overflow-x-auto">
        <div className="bg-white dark:bg-black-600 border soft-shadow rounded-xl pb-1">
          <div className="pl-6 max-w-lg w-full py-5">
            <div className="pl-6 max-w-sm leading-7 h-4" />
          </div>
          <table className="min-w-full divide-y dark:divide-black-200 border-t">
            <tbody className="bg-white dark:bg-black-600 divide-y dark:divide-black-200">
              <tr className="h-[57px]">
                <td
                  className="px-6 py-4 text-gray-400 text-xs rounded-b-xl"
                  colSpan={100}
                >
                  <ErrorMessage
                    icons={<FaInbox />}
                    message=""
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
      <div>
        <div className="container-xxl mx-auto px-5">
          <h1 className="py-5 dark:text-neargray-10 text-nearblue-600 text-lg font-medium">
            {t('blockHeading') || 'Latest Near Protocol Blocks'}
          </h1>
        </div>
      </div>
      <div className="container-xxl mx-auto px-4">
        <div className="relative block lg:flex lg:space-x-2">
          <div className="w-full">
            <ErrorBoundary fallback={errorBoundaryFallback}>
              <Suspense fallback={<ListSkeleton />}>
                <ListActions
                  dataPromise={getRequestBeta('v3/blocks', { cursor })}
                  countPromise={getRequestBeta('v3/blocks/count')}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
}
