'use client';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

const ThemeInitializer = ({ initialTheme }: { initialTheme: string }) => {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme && initialTheme !== theme) {
      Cookies.set('theme', theme, { expires: 365, path: '/' });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default ThemeInitializer;
