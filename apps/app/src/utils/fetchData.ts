import fetcher from './fetcher';
import search from './search';

export async function fetchData(q?: string, keyword?: string, filter?: string) {
  const key = keyword?.replace(/[\s,]/g, '');
  const query = q?.replace(/[\s,]/g, '');

  try {
    const [
      statsResult,
      latestBlocksResult,
      searchResult,
      searchRedirectResult,
    ] = await Promise.allSettled([
      fetcher(`stats`),
      fetcher(`blocks/latest?limit=1`),
      key && filter ? search(key, filter, false) : Promise.resolve({}),
      query && filter ? search(query, filter, true) : Promise.resolve({}),
    ]);

    const statsDetails =
      statsResult.status === 'fulfilled' ? statsResult.value : null;

    const latestBlocks =
      latestBlocksResult.status === 'fulfilled'
        ? latestBlocksResult.value
        : null;

    const searchResultDetails =
      searchResult.status === 'fulfilled' ? searchResult.value : {};

    const searchRedirectDetails =
      searchRedirectResult.status === 'fulfilled'
        ? searchRedirectResult.value
        : {};

    const error: boolean = statsResult.status === 'rejected';

    return {
      statsDetails,
      latestBlocks,
      searchResultDetails,
      searchRedirectDetails,
      error,
    };
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return {
      statsDetails: null,
      latestBlocks: null,
      searchResultDetails: null,
      searchRedirectDetails: null,
      error: true,
    };
  }
}
