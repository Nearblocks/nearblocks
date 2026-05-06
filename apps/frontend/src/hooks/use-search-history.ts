'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY = 'nearblocks:search-history';
const MAX = 25;

export const useSearchHistory = () => {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  const addToHistory = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setHistory((prev) => {
      const deduped = prev.filter((q) => q !== trimmed);
      const next = [trimmed, ...deduped].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));

      return next;
    });
  }, []);

  const removeFromHistory = useCallback((query: string) => {
    setHistory((prev) => {
      const next = prev.filter((q) => q !== query);
      localStorage.setItem(KEY, JSON.stringify(next));

      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(KEY);
    setHistory([]);
  }, []);

  return { addToHistory, clearHistory, history, removeFromHistory };
};
