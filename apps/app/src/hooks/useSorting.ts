import { stripEmpty } from '@/utils/libs';
import queryString from 'qs';
import { useMemo, useCallback, useState } from 'react';

type Sorting = {
  order: string;
  [key: string]: any;
};

const values: Sorting = { order: 'desc' };

const useSorting = (initial?: Partial<Sorting>) => {
  const [sorting, setState] = useState<Sorting>({ ...values, ...initial });

  const sqs = useMemo(() => queryString.stringify(sorting), [sorting]);

  const setSorting = useCallback(
    (key: keyof Sorting | ((s: Sorting) => Sorting), value?: any) => {
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

  return { sqs, sorting, setSorting, resetSorting };
};

export default useSorting;
