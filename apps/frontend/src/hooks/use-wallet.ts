'use client';

import { useContext } from 'react';
import { useStore } from 'zustand';

import { WalletContext } from '@/providers/config';
import { WalletState } from '@/stores/wallet';

export const useWallet = <T>(selector: (state: WalletState) => T): T => {
  const store = useContext(WalletContext);

  if (!store) throw new Error('Wallet store is missing');

  return useStore(store, selector);
};
