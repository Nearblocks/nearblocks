import { create } from 'zustand';

interface StoreState {
  latestStats: any;
  syncStatus: string | null;
  setLatestStats: (latestStats: any) => void;
  setSyncStatus: (syncStatus: string | null) => void;
}

const useStatsStore = create<StoreState>((set) => ({
  latestStats: null,
  syncStatus: null,

  setLatestStats: (latestStats) => set({ latestStats }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
}));

export default useStatsStore;
