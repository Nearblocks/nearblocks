'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function useFallbackPathname(): string {
  const pathname = usePathname();
  const [Path, setPath] = useState<string>('/');

  useEffect(() => {
    if (pathname) {
      setPath(pathname);
    } else if (typeof window !== 'undefined' && window.location.pathname) {
      setPath(window.location.pathname);
    }
  }, [pathname]);

  return Path;
}
