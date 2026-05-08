'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY = 'nearblocks:search-history';
const MAX = 25;

export type HistoryEntry = {
  href: string;
  label: string;
  type: 'account' | 'block' | 'token' | 'txn';
};

export const useSearchHistory = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setHistory(
            parsed.filter(
              (e) =>
                e &&
                typeof e === 'object' &&
                typeof e.label === 'string' &&
                typeof e.href === 'string' &&
                typeof e.type === 'string',
            ),
          );
        }
      }
    } catch {}
  }, []);

  const addToHistory = useCallback((entry: HistoryEntry) => {
    if (!entry.label.trim()) return;

    setHistory((prev) => {
      const deduped = prev.filter((e) => e.href !== entry.href);
      const next = [entry, ...deduped].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));

      return next;
    });
  }, []);

  const removeFromHistory = useCallback((href: string) => {
    setHistory((prev) => {
      const next = prev.filter((e) => e.href !== href);
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
