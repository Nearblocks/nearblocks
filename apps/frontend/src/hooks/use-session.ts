'use client';

import { useContext } from 'react';
import { useStore } from 'zustand';

import { SessionContext } from '@/providers/config';
import { SessionState } from '@/stores/session';

export const useSession = <T>(selector: (state: SessionState) => T): T => {
  const store = useContext(SessionContext);

  if (!store) throw new Error('Session store is missing');

  return useStore(store, selector);
};
