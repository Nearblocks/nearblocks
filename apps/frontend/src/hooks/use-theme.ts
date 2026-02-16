import { useEffect, useState } from 'react';

import { defaultTheme } from '@/lib/config';
import { Theme } from '@/types/enums';

const getTheme = (): Theme => {
  if (typeof document === 'undefined') return defaultTheme;
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

export const useTheme = (): Theme => {
  const [theme, setTheme] = useState<Theme>(getTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(getTheme());
    });

    observer.observe(document.documentElement, {
      attributeFilter: ['class'],
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  return theme;
};
