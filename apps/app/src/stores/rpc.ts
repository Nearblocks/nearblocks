import { create } from 'zustand';

import { RpcProviders } from '@/utils/rpc';

const setClientCookie = (name: string, value: string, days = 365) => {
  if (typeof document !== 'undefined') {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  }
};

const getClientCookie = (name: string) => {
  if (typeof document !== 'undefined') {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  }
  return null;
};

type RpcState = {
  errorCount: number;
  resetErrorCount: () => void;
  rpc: string;
  setRpc: (rpc: string) => void;
  switchRpc: () => void;
};

export const useRpcStore = create<RpcState>((set, get) => ({
  errorCount: 0,
  resetErrorCount: () => {
    set({ errorCount: 0 });
  },
  rpc: getClientCookie('rpcUrl') || RpcProviders?.[0]?.url || '',
  setRpc: (rpc: string) => {
    setClientCookie('rpcUrl', rpc);
    set(() => ({ errorCount: 0, rpc }));
  },
  switchRpc: () => {
    const { errorCount, rpc } = get();

    if (errorCount >= RpcProviders?.length) {
      throw new Error('All RPC providers have resulted in errors.');
    }

    const currentIndex = RpcProviders.findIndex(
      (provider) => provider.url === rpc,
    );
    const nextIndex = (currentIndex + 1) % RpcProviders?.length;
    const nextRpc = RpcProviders[nextIndex].url;

    setClientCookie('rpcUrl', nextRpc);
    set({ errorCount: errorCount + 1, rpc: nextRpc });
  },
}));
