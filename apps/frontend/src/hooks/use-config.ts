'use client';

import { useContext } from 'react';
import { useStore } from 'zustand';

import { ConfigContext } from '@/providers/config';
import { ConfigState } from '@/stores/config';

export const useConfig = <T>(selector: (state: ConfigState) => T): T => {
  const store = useContext(ConfigContext);

  if (!store) throw new Error('Configs are missing');

  return useStore(store, selector);
};
