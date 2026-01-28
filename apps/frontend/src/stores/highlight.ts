import { create } from 'zustand';

type HighlightState = {
  highlighted: null | string;
  setHighlighted: (highlighted: null | string) => void;
};

export const useHighlightStore = create<HighlightState>((set) => ({
  highlighted: null,
  setHighlighted: (highlighted) => set({ highlighted }),
}));
