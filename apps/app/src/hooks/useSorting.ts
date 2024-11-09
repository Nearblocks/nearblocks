import queryString from 'qs';
import { useCallback, useMemo, useState } from 'react';

import { stripEmpty } from '@/utils/libs';

type Sorting = {
  [key: string]: any;
  order: string;
};

const values: Sorting = { order: 'desc' };

const useSorting = (initial?: Partial<Sorting>) => {
  const [sorting, setState] = useState<Sorting>({ ...values, ...initial });

  const sqs = useMemo(() => queryString.stringify(sorting), [sorting]);

  const setSorting = useCallback(
    (key: ((s: Sorting) => Sorting) | keyof Sorting, value?: any) => {
      if (typeof key === 'function') {
        return setState((s) => stripEmpty<Sorting>(key(s)));
      }

      return setState((s) => stripEmpty<Sorting>({ ...s, [key]: value }));
    },
    [],
  );

  const resetSorting = useCallback(
    () => setState({ ...values, ...initial }),
    [initial],
  );

  return { resetSorting, setSorting, sorting, sqs };
};

export default useSorting;
