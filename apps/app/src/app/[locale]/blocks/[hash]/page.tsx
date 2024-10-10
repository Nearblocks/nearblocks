import Details from '@/components/app/Blocks/Details';
import { nanoToMilli } from '@/utils/app/libs';
import { Suspense } from 'react';
import HashLoading from '@/components/app/skeleton/blocks/hash';
import { getRequest } from '@/utils/app/api';
import { unstable_setRequestLocale } from 'next-intl/server';

export default async function Hash({
  params: { hash, locale },
}: {
  params: { hash: string; locale: string };
}) {
  unstable_setRequestLocale(locale);

  const [hashData, priceData] = await fetchHashAndPriceData(hash);

  return (
    <>
      <div className="relative container mx-auto px-3">
        <Suspense fallback={<HashLoading />}>
          <Details
            hash={hash}
            data={hashData}
            loading={!hashData}
            price={priceData}
          />
        </Suspense>
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
