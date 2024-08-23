import { RpcProviders } from '@/utils/rpc';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type RpcState = {
  rpc: string;
  setRpc: (rpc: string) => void;
};

export const useRpcStore = create(
  persist<RpcState>(
    (set) => ({
      rpc: RpcProviders?.[0]?.url,
      setRpc: (rpc) => set(() => ({ rpc })),
    }),
    { name: 'rpc-url' },
  ),
);
