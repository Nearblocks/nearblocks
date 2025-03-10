import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Details from '@/components/app/Blocks/Details';
import ErrorMessage from '@/components/app/common/ErrorMessage';
import FileSlash from '@/components/app/Icons/FileSlash';
import HashLoading from '@/components/app/skeleton/blocks/hash';
import { getRequest } from '@/utils/app/api';
import { nanoToMilli } from '@/utils/app/libs';

export default async function Hash(props: {
  params: Promise<{ hash: string; locale: string }>;
}) {
  const params = await props.params;

  const { hash } = params;

  const [hashData, priceData] = await fetchHashAndPriceData(hash);

  const errorBoundaryFallback = (
    <>
      <>
        <div className="relative container-xxl mx-auto p-5 ">
          <div className="text-nearblue-700 text-xs px-2 mb-5">
            <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
              <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid divide-gray-200 dark:divide-black-200 divide-y">
                <ErrorMessage
                  icons={<FileSlash />}
                  message="Sorry, We are unable to locate this BlockHash"
                  mutedText={''}
                  reset
                />
              </div>
            </div>
          </div>
        </div>
      </>
    </>
  );

  return (
    <>
      <div className="relative container-xxl mx-auto px-5">
        <ErrorBoundary fallback={errorBoundaryFallback}>
          <Suspense fallback={<HashLoading />}>
            <Details data={hashData} loading={!hashData} price={priceData} />
          </Suspense>
        </ErrorBoundary>
      </div>
      <div className="py-8"></div>
    </>
  );
}

async function fetchHashAndPriceData(hash: string) {
  const hashDataPromise = fetchHashData(hash);

  const priceDataPromise = hashDataPromise.then(async (data) => {
    const timestamp = data?.blocks?.[0]?.block_timestamp;
    return timestamp ? fetchPriceData(timestamp) : null;
  });

  const [hashData, priceData] = await Promise.all([
    hashDataPromise,
    priceDataPromise,
  ]);
  return [hashData, priceData];
}

async function fetchHashData(hash: string) {
  return getRequest(`blocks/${hash}`);
}

async function fetchPriceData(timestamp: any) {
  const formattedTimestamp = formatTimestamp(timestamp);
  return getRequest(`stats/price?date=${formattedTimestamp}`);
}

function formatTimestamp(timestamp: any) {
  return new Date(nanoToMilli(timestamp)).toISOString().split('T')[0];
}
