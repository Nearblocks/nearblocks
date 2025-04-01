import { create } from 'zustand';
import Cookies from 'js-cookie';

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

export const useRpcStore = create<RpcState>((set, get) => ({
  errorCount: 0,
  providers: [],
  resetErrorCount: () => {
    set({ errorCount: 0 });
  },
  rpc: Cookies.get('rpcUrl') || '',
  setProviders: (providers) => {
    set({ providers });
    const { rpc } = get();
    if (!rpc || !providers?.find((p) => p.url === rpc)) {
      const defaultRpc = providers[0]?.url || '';
      if (defaultRpc) {
        Cookies.set('rpcUrl', defaultRpc, { expires: 365, path: '/' });
        set({ rpc: defaultRpc });
      }
    }
  },
  setRpc: (rpc: string) => {
    Cookies.set('rpcUrl', rpc, { expires: 365, path: '/' });
    set(() => ({ errorCount: 0, rpc }));
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

    Cookies.set('rpcUrl', nextRpc, { expires: 365, path: '/' });
    set({ errorCount: errorCount + 1, rpc: nextRpc });
  },
}));
