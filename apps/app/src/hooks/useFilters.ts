import { stripEmpty } from '@/utils/libs';
import queryString from 'qs';
import { useMemo, useCallback, useState } from 'react';

type Filters = Record<string, any>;

const useFilters = (initial?: Filters) => {
  const [filters, setState] = useState<Filters>(() => initial);

  const qs = useMemo(() => queryString.stringify(filters), [filters]);

  const setFilters = useCallback(
    (key: keyof Filters | ((s: Filters) => Filters), value?: any) => {
      if (typeof key === 'function') {
        return setState((s) => stripEmpty(key(s)));
      }

      return setState((s) => stripEmpty({ ...s, [key]: value }));
    },
    [],
  );

  return { qs, filters, setFilters };
};

export default useFilters;
