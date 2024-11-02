import { create } from 'zustand';

export type RpcProvider = {
  name: string;
  url: string;
};

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
    const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
    const targetCookie = cookies.find((cookie) =>
      cookie.startsWith(`${name}=`),
    );
    if (targetCookie) {
      return targetCookie.split('=')[1];
    }
  }
  return null;
};

type RpcState = {
  rpc: string;
  errorCount: number;
  providers: RpcProvider[];
  setRpc: (rpc: string) => void;
  switchRpc: () => void;
  resetErrorCount: () => void;
  setProviders: (providers: RpcProvider[]) => void;
};

export const useRpcStore = create<RpcState>((set, get) => ({
  rpc: getClientCookie('rpcUrl') || '',
  errorCount: 0,
  providers: [],
  setProviders: (providers) => {
    set({ providers });
    const { rpc } = get();
    if (!rpc || !providers?.find((p) => p.url === rpc)) {
      const defaultRpc = providers[0]?.url || '';
      if (defaultRpc) {
        setClientCookie('rpcUrl', defaultRpc);
        set({ rpc: defaultRpc });
      }
    }
  },
  setRpc: (rpc: string) => {
    setClientCookie('rpcUrl', rpc);
    set(() => ({ rpc, errorCount: 0 }));
  },
  switchRpc: () => {
    const { rpc, errorCount, providers } = get();

    if (errorCount >= providers.length) {
      throw new Error('All RPC providers have resulted in errors.');
    }

    const currentIndex = providers.findIndex(
      (provider) => provider.url === rpc,
    );
    const nextIndex = (currentIndex + 1) % providers.length;
    const nextRpc = providers[nextIndex].url;

    setClientCookie('rpcUrl', nextRpc);
    set({ rpc: nextRpc, errorCount: errorCount + 1 });
  },
  resetErrorCount: () => {
    set({ errorCount: 0 });
  },
}));
