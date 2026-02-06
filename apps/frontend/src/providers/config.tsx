'use client';

import { createContext, useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import { Config } from '@/lib/config';
import { initConfigStore } from '@/stores/config';
import { initPreferencesStore } from '@/stores/preferences';
import { initWalletStore } from '@/stores/wallet';

type Props = PropsWithChildren<{
  value: Config;
}>;

export const ConfigContext = createContext<Config | null>(null);

export const ConfigProvider = ({ children, value }: Props) => {
  useEffect(() => {
    initConfigStore(value);
    initPreferencesStore(value.networkId, value.providers);
    initWalletStore({
      mainnetUrl: value.mainnetUrl,
      network: value.networkId,
      projectId: value.reownProjectId,
      providers: value.providers,
      testnetUrl: value.testnetUrl,
    });
  }, [value]);

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
};
