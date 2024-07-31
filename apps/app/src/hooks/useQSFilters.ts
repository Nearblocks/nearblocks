import queryString from 'qs';
import { useRouter } from 'next/router';
import { useRef, useMemo, useCallback } from 'react';
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
  initial?: Record<string, any> | (() => Record<string, any>),
) => {
  const { route, query, replace, asPath } = useRouter();

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
    | keyof typeof filters
    | ((filters: Record<string, any>) => Record<string, any>);

  const setFilters = useCallback(
    (key: SetFiltersArg, value?: any) => {
      if (typeof key === 'function') {
        return urlReplace(key(filters));
      }

      return urlReplace({ ...filters, [key]: value });
    },
    [filters, urlReplace],
  );

  return { qs, filters, setFilters };
};

export default useQSFilters;
