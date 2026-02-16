import { createStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Config } from '@/lib/config';
import type { Network } from '@/types/enums';

type RpcProvider = Config['provider'];

export type TimestampMode = 'age' | 'time';
export type UTCMode = 'local' | 'utc';

interface SettingsActions {
  setHydrated: (value: boolean) => void;
  setProvider: (provider: RpcProvider) => void;
  toggleTimestampMode: () => void;
  toggleUTCMode: () => void;
}

export interface SettingsState extends SettingsActions {
  hydrated: boolean;
  provider: null | RpcProvider;
  providers: RpcProvider[];
  timestampMode: TimestampMode;
  utcMode: UTCMode;
}

export type SettingsStore = ReturnType<typeof createSettingsStore>;

export const createSettingsStore = (
  network: Network,
  provider: RpcProvider,
) => {
  return createStore<SettingsState>()(
    persist(
      /* eslint-disable perfectionist/sort-objects */
      (set, get) => ({
        hydrated: false,
        provider,
        providers: [],
        timestampMode: 'age',
        utcMode: 'utc',
        setHydrated: (hydrated) => set({ hydrated }),
        setProvider: (provider) => set({ provider }),
        toggleTimestampMode: () => {
          const mode = get().timestampMode;
          set({ timestampMode: mode === 'age' ? 'time' : 'age' });
        },
        toggleUTCMode: () => {
          const mode = get().utcMode;
          set({ utcMode: mode === 'local' ? 'utc' : 'local' });
        },
      }),
      /* eslint-enable perfectionist/sort-objects */
      {
        name: `nearblocks:${network}`,
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.error('rehydration error', error);
          }
          state?.setHydrated(true);
        },
        partialize: (state) => ({
          provider: state.provider,
          providers: state.providers,
          timestampMode: state.timestampMode,
          utcMode: state.utcMode,
        }),
        storage: createJSONStorage(() => localStorage),
      },
    ),
  );
};
