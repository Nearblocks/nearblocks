'use client';

import { createStore } from 'zustand/vanilla';

import type { Config } from '@/lib/config';

export type ConfigState = {
  config: Config;
};

export type ConfigStore = ReturnType<typeof createConfigStore>;

export const createConfigStore = (config: Config) => {
  return createStore<ConfigState>()(() => ({ config }));
};
