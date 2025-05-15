'use client';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function useFallbackPathname() {
  const pathname = usePathname();
  const [path, setPath] = useState<string | null>(null);
  useEffect(() => {
    if (pathname) {
      setPath(pathname);
    } else if (typeof window !== 'undefined') {
      setPath(window.location.pathname);
    }
  }, [pathname]);

  return path;
}
