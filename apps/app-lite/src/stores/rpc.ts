import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { providers } from '@/libs/rpc';

type RpcState = {
  rpc: string;
  setRpc: (rpc: string) => void;
};

export const useRpcStore = create(
  persist<RpcState>(
    (set) => ({
      rpc: providers?.[0]?.url,
      setRpc: (rpc) => set(() => ({ rpc })),
    }),
    { name: 'rpc-url' },
  ),
);
