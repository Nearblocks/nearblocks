import { create } from 'zustand';

type VmState = {
  cache: any;
  CommitButton: any;
  ethersContext: any;
  EthersProvider: any;
  near: any;
  Widget: any;
};

type VmStore = VmState & {
  set: (update: VmState) => void;
};

export const useVmStore = create<VmStore>((set) => ({
  cache: null,
  CommitButton: null,
  ethersContext: null,
  EthersProvider: null,
  near: null,
  set: (params) => set(() => ({ ...params })),
  Widget: null,
}));
