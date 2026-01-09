'use client';

import { createContext, useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import { Config } from '@/lib/config';
import { initConfigStore } from '@/stores/config';
import { initRpcStore } from '@/stores/rpc';

type Props = PropsWithChildren<{
  value: Config;
}>;

export const ConfigContext = createContext<Config | null>(null);

export const ConfigProvider = ({ children, value }: Props) => {
  useEffect(() => {
    initConfigStore(value);
    initRpcStore(value.networkId, value.providers);
  }, [value]);

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
};
