import { RpcProviders } from '@/utils/rpc';
import { create } from 'zustand';

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
  rpc: string;
  setRpc: (rpc: string) => void;
  switchRpc: () => void;
};

export const useRpcStore = create<RpcState>((set, get) => ({
  rpc: getClientCookie('rpcUrl') || RpcProviders?.[0]?.url || '',
  setRpc: (rpc: string) => {
    setClientCookie('rpcUrl', rpc);
    set(() => ({ rpc }));
  },
  switchRpc: () => {
    const currentIndex = RpcProviders.findIndex(
      (provider) => provider.url === get().rpc,
    );
    const nextIndex = (currentIndex + 1) % RpcProviders.length;
    const nextRpc = RpcProviders[nextIndex].url;
    setClientCookie('rpcUrl', nextRpc);
    set({ rpc: nextRpc });
  },
}));
