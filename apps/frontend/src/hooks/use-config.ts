'use client';

import { useContext } from 'react';

import type { Config } from '@/lib/config';
import { ConfigContext } from '@/providers/config';
import { useConfigStore } from '@/stores/config';

export const useConfig = <T>(selector: (config: Config) => T): T => {
  const config = useContext(ConfigContext);
  if (!config) throw new Error('Configs are missing');

  // Subscribe to the store so client-side updates (e.g. RPC provider selection)
  // re-render, but fall back to the server-provided context value until hydrated.
  return useConfigStore((s) => selector(s.config ?? config));
};
