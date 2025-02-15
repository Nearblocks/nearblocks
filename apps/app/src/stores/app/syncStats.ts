import { create } from 'zustand';

type SyncData = {
  height: string;
  sync: boolean;
  timestamp: string;
};

type DataObject = {
  balance: SyncData;
  base: SyncData;
  events: SyncData;
};

interface StoreState {
  latestStats: any;
  syncStatus: DataObject | null;
  setLatestStats: (latestStats: any) => void;
  setSyncStatus: (syncStatus: DataObject | null) => void;
}

const useStatsStore = create<StoreState>((set) => ({
  latestStats: null,
  syncStatus: null,

  setLatestStats: (latestStats) => set({ latestStats }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
}));

export default useStatsStore;
