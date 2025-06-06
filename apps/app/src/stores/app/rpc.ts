import { create } from 'zustand';

export type RpcProvider = {
  name: string;
  url: string;
};

type RpcState = {
  errorCount: number;
  providers: RpcProvider[];
  resetErrorCount: () => void;
  rpc: string;
  setProviders: (providers: RpcProvider[]) => void;
  setRpc: (rpc: string) => void;
  switchRpc: () => void;
};

const LOCAL_STORAGE_KEY = 'rpcUrl';

function getRpcFromStorage(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(LOCAL_STORAGE_KEY) || '';
}

function setRpcToStorage(url: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, url);
}

export const useRpcStore = create<RpcState>((set, get) => ({
  errorCount: 0,
  providers: [],
  rpc: getRpcFromStorage(),

  resetErrorCount: () => {
    set({ errorCount: 0 });
  },

  setProviders: (providers) => {
    set({ providers });
    const { rpc } = get();
    const rpcExists = providers.find((p) => p.url === rpc);
    if (!rpc || !rpcExists) {
      const defaultRpc = providers[0]?.url || '';
      if (defaultRpc) {
        setRpcToStorage(defaultRpc);
        set({ rpc: defaultRpc });
      }
    }
  },

  setRpc: (rpc: string) => {
    setRpcToStorage(rpc);
    set({ errorCount: 0, rpc });
  },

  switchRpc: () => {
    const { errorCount, providers, rpc } = get();
    if (errorCount >= providers.length) {
      throw new Error('All RPC providers have resulted in errors.');
    }

    const currentIndex = providers.findIndex(
      (provider) => provider.url === rpc,
    );
    const nextIndex = (currentIndex + 1) % providers.length;
    const nextRpc = providers[nextIndex].url;

    setRpcToStorage(nextRpc);
    set({ errorCount: errorCount + 1, rpc: nextRpc });
  },
}));
