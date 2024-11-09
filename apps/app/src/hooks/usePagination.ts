import queryString from 'qs';
import { useCallback, useMemo, useState } from 'react';

import { stripEmpty } from '@/utils/libs';

type Pagination = {
  [key: string]: any; // Add more properties as needed
  page: number;
  per_page: number;
};

const values: Pagination = { page: 1, per_page: 25 };

const usePagination = (initial?: Partial<Pagination>) => {
  const [pagination, setState] = useState<Pagination>({
    ...values,
    ...initial,
  });

  const pqs = useMemo(() => queryString.stringify(pagination), [pagination]);

  const setPagination = useCallback(
    (key: ((s: Pagination) => Pagination) | keyof Pagination, value?: any) => {
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

  return { pagination, pqs, resetPagination, setPagination };
};

export default usePagination;
