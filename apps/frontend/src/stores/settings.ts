import { createStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Network } from '@/types/enums';

export type TimestampMode = 'age' | 'time';
export type UTCMode = 'local' | 'utc';

interface SettingsActions {
  setHydrated: (value: boolean) => void;
  toggleTimestampMode: () => void;
  toggleUTCMode: () => void;
}

export interface SettingsState extends SettingsActions {
  hydrated: boolean;
  timestampMode: TimestampMode;
  utcMode: UTCMode;
}

export type SettingsStore = ReturnType<typeof createSettingsStore>;

export const createSettingsStore = (network: Network) => {
  return createStore<SettingsState>()(
    persist(
      /* eslint-disable perfectionist/sort-objects */
      (set, get) => ({
        hydrated: false,
        timestampMode: 'age',
        utcMode: 'utc',
        setHydrated: (hydrated) => set({ hydrated }),
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
        // v3: the RPC provider is no longer user-selectable; drop any saved
        // provider so every browser goes through the proxied default.
        migrate: (persisted) => {
          const { timestampMode, utcMode } = (persisted ??
            {}) as Partial<SettingsState>;

          return { timestampMode, utcMode } as Partial<SettingsState>;
        },
        name: `nearblocks:${network}`,
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.error('rehydration error', error);
          }
          state?.setHydrated(true);
        },
        partialize: (state) => ({
          timestampMode: state.timestampMode,
          utcMode: state.utcMode,
        }),
        storage: createJSONStorage(() =>
          typeof window !== 'undefined'
            ? localStorage
            : {
                getItem: () => null,
                removeItem: () => void 0,
                setItem: () => void 0,
              },
        ),
        version: 3,
      },
    ),
  );
};
