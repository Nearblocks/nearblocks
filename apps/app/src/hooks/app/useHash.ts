import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { usePathname } from '@/i18n/routing';

const useHash = (): [string | undefined, (newHash: string) => void] => {
  const router = useRouter();
  const asPath = usePathname();

  const hash = useMemo(() => asPath.split('#')[1], [asPath]);

  const setHash = useCallback(
    (newHash: string) => {
      // @ts-ignore: Unreachable code error
      router.push({
        hash: newHash,
        pathname: new URL(asPath, 'http://localhost/').pathname,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asPath, router.push],
  );

  return [hash, setHash];
};

export default useHash;
