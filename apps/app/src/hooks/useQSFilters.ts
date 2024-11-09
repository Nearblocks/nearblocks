import { useRouter } from 'next/router';
import queryString from 'qs';
import { useCallback, useMemo, useRef } from 'react';

import { stripEmpty } from '@/utils/libs';

const isRouteParam = (route: string, param: string): boolean =>
  new RegExp(`\\[${param}\\]`, 'g').test(route);

const filterRouteParams = (
  query: Record<string, any>,
  route: string,
): Record<string, any> =>
  Object.entries(query).reduce(
    (obj, [k, v]) =>
      isRouteParam(route, k) ? obj : Object.assign(obj, { [k]: v }),
    {},
  );

const useQSFilters = (
  initial?: (() => Record<string, any>) | Record<string, any>,
) => {
  const { asPath, query, replace, route } = useRouter();

  const initialRef = useRef<Record<string, any>>(
    typeof initial === 'function' ? initial() : initial || {},
  );

  const filters = useMemo(
    () => ({
      ...initialRef.current,
      ...filterRouteParams(query, route),
    }),
    [route, query],
  );

  const qs = useMemo(() => {
    return queryString.stringify(filters);
  }, [filters]);

  const urlReplace = useCallback(
    (newQuery: Record<string, any>) =>
      replace(
        {
          pathname: new URL(asPath, 'http://localhost/').pathname,
          query: stripEmpty(newQuery),
        },
        undefined,
        {
          shallow: true,
        },
      ),
    [asPath, replace],
  );

  type SetFiltersArg =
    | ((filters: Record<string, any>) => Record<string, any>)
    | keyof typeof filters;

  const setFilters = useCallback(
    (key: SetFiltersArg, value?: any) => {
      if (typeof key === 'function') {
        return urlReplace(key(filters));
      }

      return urlReplace({ ...filters, [key]: value });
    },
    [filters, urlReplace],
  );

  return { filters, qs, setFilters };
};

export default useQSFilters;
