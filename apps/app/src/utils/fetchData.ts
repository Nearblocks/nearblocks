import fetcher from './fetcher';

export async function fetchData() {
  try {
    const [statsResult, latestBlocksResult] = await Promise.allSettled([
      fetcher(`stats`),
      fetcher(`blocks/latest?limit=1`),
    ]);

    const statsDetails =
      statsResult.status === 'fulfilled' ? statsResult.value : null;

    const latestBlocks =
      latestBlocksResult.status === 'fulfilled'
        ? latestBlocksResult.value
        : null;

    const error: boolean = statsResult.status === 'rejected';

    return {
      statsDetails,
      latestBlocks,

      error,
    };
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return {
      statsDetails: null,
      latestBlocks: null,
      error: true,
    };
  }
}
