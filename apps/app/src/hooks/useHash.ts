import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';

const useHash = (): [string | undefined, (newHash: string) => void] => {
  const { push, asPath } = useRouter();

  const hash = useMemo(() => asPath.split('#')[1], [asPath]);

  const setHash = useCallback(
    (newHash: string) => {
      if (asPath) {
        const pathname = asPath.split('#')[0];
        push({ pathname, hash: newHash }, undefined, { shallow: true });
      }
    },
    [asPath, push],
  );

  return [hash, setHash];
};

export default useHash;
