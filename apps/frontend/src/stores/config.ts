'use client';

import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

import type { Config } from '@/lib/config';

type ConfigStoreState = {
  config: Config | null;
  patchConfig: (patch: Partial<Config>) => void;
  setConfig: (config: Config) => void;
};

export const configStore = createStore<ConfigStoreState>((set, get) => ({
  config: null,
  patchConfig: (patch) => {
    const current = get().config;
    if (!current) return;
    const next = { ...current, ...patch };
    set({ config: next });
  },
  setConfig: (config) => {
    set({ config });
  },
}));

export const initConfigStore = (config: Config) => {
  configStore.getState().setConfig(config);
};

export const useConfigStore = <T>(selector: (state: ConfigStoreState) => T) =>
  useStore(configStore, selector);

export const getConfig = (): Config => {
  const config = configStore.getState().config;
  if (!config) throw new Error('Configs are missing');
  return config;
};
export const setConfig = (config: Config) =>
  configStore.getState().setConfig(config);
export const patchConfig = (patch: Partial<Config>) =>
  configStore.getState().patchConfig(patch);
