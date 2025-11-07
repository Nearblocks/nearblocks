'use client';

import { SearchResult } from '@/utils/types';
const useSearchHistory = () => {
  const isClient = typeof window !== 'undefined';
  const host = isClient ? window.location.host : '';
  const baseUrl = isClient ? `https://${host}/` : '';
  const storageKey = 'search-history';
  const deleteKey = 'search-cache';
  const MAX_ENTRIES = 5;

  const setSearchResults = async (
    query: string,
    filter: string,
    results: SearchResult,
  ): Promise<void> => {
    if (!results || Object.keys(results).length === 0) return;
    if (!query.trim()) return;
    const cacheExists = await caches.has(deleteKey);
    if (cacheExists) {
      await caches.delete(deleteKey);
    }
    const cache = await caches.open(storageKey);
    const requestKey = `${filter}:${query}`;
    const keys = await cache.keys();
    const entries = [];

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const data = await response.json();
        entries.push({
          key: request.url,
          timestamp: data.timestamp || 0,
        });
      }
    }

    entries.sort((a, b) => b.timestamp - a.timestamp);

    if (entries.length >= MAX_ENTRIES) {
      const oldestKey = entries[entries.length - 1].key;
      await cache.delete(oldestKey);
    }

    if (isClient) {
      const url = new URL(requestKey, baseUrl);
      const request = new Request(url.toString());
      const response = new Response(
        JSON.stringify({
          query,
          filter,
          results,
          timestamp: Date.now(),
        }),
      );
      await cache.put(request, response);
    }
  };

  const getSearchResults = async (
    query: string,
    filter: string,
  ): Promise<SearchResult | null> => {
    if (!query.trim()) return null;
    const requestKey = `${filter}:${query}`;
    const cache = await caches.open(storageKey);

    if (isClient) {
      const url = new URL(requestKey, baseUrl);
      const request = new Request(url.toString());
      const response = await cache.match(request);

      if (response) {
        const data = await response.json();
        return data.results;
      }
    }

    return null;
  };

  const getRecentSearches = async (): Promise<
    Array<{ query: string; filter: string; results: SearchResult }>
  > => {
    try {
      const cache = await caches.open(storageKey);
      const keys = await cache.keys();
      const entries = await Promise.all(
        keys.map(async (request) => {
          const response = await cache.match(request);
          if (response) {
            const data = await response.json();
            return {
              query: data.query,
              filter: data.filter,
              results: data.results,
              timestamp: data.timestamp || 0,
            };
          }
          return null;
        }),
      );

      const validEntries = entries.filter((e) => e !== null) as Array<{
        query: string;
        filter: string;
        results: SearchResult;
        timestamp: number;
      }>;
      return validEntries
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_ENTRIES);
    } catch (error) {
      console.error('Error retrieving recent searches:', error);
      return [];
    }
  };

  const clearSearchHistory = async (): Promise<void> => {
    await caches.delete(storageKey);
  };

  return {
    setSearchResults,
    getSearchResults,
    getRecentSearches,
    clearSearchHistory,
  };
};

export default useSearchHistory;
