'use client';
import { usePathname } from '@/i18n/routing';
import { useEffect, useState } from 'react';

export default function useFallbackPathname(): string {
  const pathname = usePathname();
  const [Path, setPath] = useState<string>(pathname ?? '/');

  useEffect(() => {
    if (!pathname && typeof window !== 'undefined') {
      setPath(window.location.pathname ?? '/');
    }
  }, [pathname]);

  return Path;
}
