import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';

const useHash = (): [string | undefined, (newHash: string) => void] => {
  const { asPath, push } = useRouter();

  const hash = useMemo(() => asPath && asPath?.split('#')[1], [asPath]);

  const setHash = useCallback(
    (newHash: string) => {
      push(
        {
          hash: newHash,
          pathname: new URL(asPath, 'http://localhost/').pathname,
        },
        undefined,
        { shallow: true },
      );
    },
    [asPath, push],
  );

  return [hash, setHash];
};

export default useHash;
