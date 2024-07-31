import { stripEmpty } from '@/utils/libs';
import queryString from 'qs';
import { useMemo, useCallback, useState } from 'react';

type Pagination = {
  page: number;
  per_page: number;
  [key: string]: any; // Add more properties as needed
};

const values: Pagination = { page: 1, per_page: 25 };

const usePagination = (initial?: Partial<Pagination>) => {
  const [pagination, setState] = useState<Pagination>({
    ...values,
    ...initial,
  });

  const pqs = useMemo(() => queryString.stringify(pagination), [pagination]);

  const setPagination = useCallback(
    (key: keyof Pagination | ((s: Pagination) => Pagination), value?: any) => {
      if (typeof key === 'function') {
        return setState((s) => stripEmpty<Pagination>(key(s)));
      }

      return setState((s) => stripEmpty<Pagination>({ ...s, [key]: value }));
    },
    [],
  );

  const resetPagination = useCallback(
    () => setState({ ...values, ...initial }),
    [initial],
  );

  return { pqs, pagination, setPagination, resetPagination };
};

export default usePagination;
