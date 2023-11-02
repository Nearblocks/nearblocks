import { useCallback, useEffect } from 'react';

import { useBosLoaderStore } from '@/stores/bos-loader';

export function useBosLoaderInitializer() {
  const loaderUrl = process.env.NEXT_PUBLIC_LOADER_URL;

  const setStore = useBosLoaderStore((store) => store.set);

  const fetchRedirectMap = useCallback(
    async (url: string) => {
      setStore({
        loaderUrl: url,
      });

      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error('Network response was not OK');
        }

        const data = await res.json();

        setStore({
          hasResolved: true,
          redirectMap: data.components,
        });
      } catch (e) {
        console.error(e);

        setStore({
          failedToLoad: true,
          hasResolved: true,
        });
      }
    },
    [setStore],
  );

  useEffect(() => {
    if (loaderUrl) {
      fetchRedirectMap(loaderUrl);
    } else {
      setStore({ hasResolved: true });
    }
  }, [fetchRedirectMap, loaderUrl, setStore]);
}
