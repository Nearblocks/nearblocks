'use client';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

import { setCurrentTheme } from '@/utils/app/actions';

const ThemeInitializer = ({ initialTheme }: { initialTheme: string }) => {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme && initialTheme !== theme) {
      setCurrentTheme(theme);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default ThemeInitializer;
