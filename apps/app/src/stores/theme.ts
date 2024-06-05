import { create } from 'zustand';

type ThemeState = {
  setTheme: (theme: string) => void;
  theme: string;
};

export const useThemeStore = create<ThemeState>((set) => ({
  setTheme: (theme) => set(() => ({ theme })),
  theme: 'light',
}));
