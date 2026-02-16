'use client';

import { useContext } from 'react';
import { useStore } from 'zustand';

import { SettingsContext } from '@/providers/config';
import { SettingsState } from '@/stores/settings';

export const useSettings = <T>(selector: (state: SettingsState) => T): T => {
  const store = useContext(SettingsContext);

  if (!store) throw new Error('Settings are missing');

  return useStore(store, selector);
};
