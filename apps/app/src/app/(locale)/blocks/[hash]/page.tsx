import Details from '@/app/_components/Blocks/Details';
import { getRequest } from '@/app/utils/api';
import { nanoToMilli } from '@/app/utils/libs';

export default async function Hash({ params }: { params: { hash: string } }) {
  // Fetch both hashData and priceData concurrently
  const [hashData, priceData] = await fetchHashAndPriceData(params.hash);

  return (
    <>
      <div className="relative container mx-auto px-3">
        <Details
          hash={params.hash}
          data={hashData}
          loading={!hashData}
          price={priceData}
        />
      </div>
      <div className="py-8"></div>
    </>
  );
}

// Helper function to fetch both hash data and price data concurrently
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

// Fetch hash data based on the hash parameter
async function fetchHashData(hash: string) {
  return getRequest(`blocks/${hash}`);
}

// Fetch price data based on a timestamp
async function fetchPriceData(timestamp: any) {
  const formattedTimestamp = formatTimestamp(timestamp);
  return getRequest(`stats/price?date=${formattedTimestamp}`);
}

// Helper function to format the timestamp into a date string
function formatTimestamp(timestamp: any) {
  return new Date(nanoToMilli(timestamp)).toISOString().split('T')[0];
}
