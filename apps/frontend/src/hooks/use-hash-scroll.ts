'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export const useHashScroll = (isLoaded: boolean) => {
  const hasScrolled = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && !hasScrolled.current) {
      const hash = window.location.hash?.replace('#', '');

      if (hash) {
        const element = document.getElementById(hash);

        if (element) {
          requestAnimationFrame(() => {
            element.scrollIntoView();
            hasScrolled.current = true;
          });
        }
      }
    }
  }, [isLoaded]);

  useEffect(() => {
    hasScrolled.current = false;
  }, [pathname]);
};
