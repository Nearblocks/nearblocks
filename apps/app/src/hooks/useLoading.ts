import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const useLoading = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    const handleRouteChangeStart = (url: string) => {
      if (url !== router.asPath) {
        timeout = setTimeout(() => {
          setLoading(true);
        }, 1000);
      }
    };

    const handleRouteChangeComplete = () => {
      setLoading(false);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeComplete);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeComplete);
    };
  }, [router]);

  return { loading, setLoading };
};

export default useLoading;
