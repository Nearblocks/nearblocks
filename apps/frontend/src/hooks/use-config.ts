'use client';

import { useContext } from 'react';

import type { Config } from '@/lib/config';
import { ConfigContext } from '@/providers/config';
import { useConfigStore } from '@/stores/config';

export const useConfig = <T>(selector: (config: Config) => T): T => {
  const config = useContext(ConfigContext);
  if (!config) throw new Error('Configs are missing');

  return useConfigStore((s) => selector(s.config ?? config));
};
