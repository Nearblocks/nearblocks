'use client';

import { createContext } from 'react';
import type { PropsWithChildren } from 'react';

import { Config } from '@/lib/config';

type Props = PropsWithChildren<{
  value: Config;
}>;

export const ConfigContext = createContext<Config | null>(null);

export const ConfigProvider = ({ children, value }: Props) => (
  <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
);
