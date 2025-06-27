'use client';

import { SearchResult } from '@/utils/types';
const useSearchHistory = () => {
  const isClient = typeof window !== 'undefined';
  const host = isClient ? window.location.host : '';
  const baseUrl = isClient ? `https://${host}/` : '';

  const setSearchResults = async (
    query: string,
    filter: string,
    results: SearchResult,
  ): Promise<void> => {
    if (!results || Object.keys(results).length === 0) return;
    if (!query.trim()) return;
    const cacheKey = `${filter}:${query}`;
    const cache = await caches.open('search-cache');
    const cacheData = { query, filter, results };
    if (isClient) {
      const url = new URL(cacheKey, baseUrl);
      const request = new Request(url.toString());
      const response = new Response(JSON.stringify(cacheData));
      await cache.put(request, response);
    }
  };

  const getSearchResults = async (
    query: string,
    filter: string,
  ): Promise<SearchResult | null> => {
    if (!query.trim()) return null;
    const cacheKey = `${filter}:${query}`;
    const cache = await caches.open('search-cache');
    if (isClient) {
      const url = new URL(cacheKey, baseUrl);
      const request = new Request(url.toString());
      const response = await cache.match(request);

      if (response) {
        const data = await response.json();
        return data.results;
      }
    }

    return null;
  };
  const clearSearchHistory = async (): Promise<void> => {
    await caches.delete('search-cache');
  };

  return {
    setSearchResults,
    getSearchResults,
    clearSearchHistory,
  };
};

export default useSearchHistory;
