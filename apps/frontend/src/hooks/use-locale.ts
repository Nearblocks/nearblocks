'use client';

import { useContext, useMemo } from 'react';

import type { Locale } from '@/locales/config';
import { LocaleContext } from '@/providers/locale';
import type {
  RouteDictionary,
  RouteNamespace,
  Translator,
} from '@/types/types';

export const useLocale = <R extends RouteNamespace>(
  route?: R,
): { locale: Locale; t: Translator<RouteDictionary<R>> } => {
  const context = useContext(LocaleContext);

  if (!context) throw new Error('Locales are missing');

  const { locale, t: globalT } = context;

  const t = useMemo(() => {
    if (!route) return globalT as unknown as Translator<RouteDictionary<R>>;
    return ((key, ...params) =>
      globalT(
        `${route}.${key as string}` as any,
        ...(params as unknown as [any]),
      )) as Translator<RouteDictionary<R>>;
  }, [globalT, route]);

  return { locale, t };
};
