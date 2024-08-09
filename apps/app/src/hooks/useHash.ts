import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

const useHash = (
  param: string,
): [string | undefined, (newHash: string) => void] => {
  const router = useRouter();
  const { query, pathname, push, events } = router;

  const [hash, setHashState] = useState<string | undefined>(() => {
    const value = query[param];
    return Array.isArray(value)
      ? value.join('&')
      : (value as string | undefined);
  });

  const setHash = useCallback(
    (newValue: string) => {
      push(
        {
          pathname,
          query: { ...query, [param]: newValue },
        },
        undefined,
        { shallow: true },
      );
      setHashState(newValue);
    },
    [pathname, query, param, push],
  );

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      const newQuery = new URL(url, window.location.origin).searchParams.get(
        param,
      );
      setHashState(newQuery || undefined);
    };

    events.on('routeChangeComplete', handleRouteChange);

    return () => {
      events.off('routeChangeComplete', handleRouteChange);
    };
  }, [param, events]);

  return [hash, setHash];
};

export default useHash;
