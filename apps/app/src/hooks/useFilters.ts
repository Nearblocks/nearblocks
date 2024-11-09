import queryString from 'qs';
import { useCallback, useMemo, useState } from 'react';

import { stripEmpty } from '@/utils/libs';

type Filters = Record<string, any>;

const useFilters = (initial?: Filters) => {
  const [filters, setState] = useState<Filters>(() => initial);

  const qs = useMemo(() => queryString.stringify(filters), [filters]);

  const setFilters = useCallback(
    (key: ((s: Filters) => Filters) | keyof Filters, value?: any) => {
      if (typeof key === 'function') {
        return setState((s) => stripEmpty(key(s)));
      }

      return setState((s) => stripEmpty({ ...s, [key]: value }));
    },
    [],
  );

  return { filters, qs, setFilters };
};

export default useFilters;
