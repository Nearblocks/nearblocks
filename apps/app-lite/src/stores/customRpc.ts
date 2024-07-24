import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Rpc {
  name: string;
  url: string;
}

interface CustomRpcState {
  addRpc: (Rpc: Rpc) => void;
  customRpc: Rpc[];
  removeRpc: (url: string) => void;
}

export const useCustomRpcStore = create<CustomRpcState>()(
  persist(
    (set) => ({
      addRpc: (Rpc) =>
        set((state) => ({
          customRpc: [...state.customRpc, Rpc],
        })),
      customRpc: [],
      removeRpc: (url) =>
        set((state) => ({
          customRpc: state.customRpc.filter((Rpc) => Rpc.url !== url),
        })),
    }),
    { name: 'custom-rpc' },
  ),
);
