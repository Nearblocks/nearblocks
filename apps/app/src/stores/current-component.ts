import { create } from 'zustand';

type CurrentComponentStore = {
  setSrc: (src: null | string) => void;
  src: null | string;
};

export const useCurrentComponentStore = create<CurrentComponentStore>(
  (set) => ({
    setSrc: (src) => set(() => ({ src })),
    src: null,
  }),
);
