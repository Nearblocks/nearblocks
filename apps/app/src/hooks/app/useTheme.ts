import { useThemeStore } from '@/stores/theme';
import { useEffect } from 'react';

export const useTheme = () => {
  const setTheme = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    const updateTheme = (elm: HTMLElement) =>
      setTheme(elm.className.includes('dark') ? 'dark' : 'light');

    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          updateTheme(mutation.target as HTMLElement);
        }
      }
    });

    updateTheme(document.documentElement);
    observer.observe(document.documentElement, {
      attributeFilter: ['class'],
      attributes: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [setTheme]);
};
