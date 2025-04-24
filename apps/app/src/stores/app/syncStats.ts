import { create } from 'zustand';

type Indexers = {
  balance: { height: number; sync: boolean; timestamp: string };
  base: { height: string; sync: boolean; timestamp: string };
  events: { height: number; sync: boolean; timestamp: string };
};
interface StoreState {
  latestStats: any;
  syncStatus: Indexers | null;
  setLatestStats: (latestStats: any) => void;
  setSyncStatus: (syncStatus: Indexers | null) => void;
}

const useStatsStore = create<StoreState>((set) => ({
  latestStats: null,
  syncStatus: null,

  setLatestStats: (latestStats) => set({ latestStats }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
}));

export default useStatsStore;
