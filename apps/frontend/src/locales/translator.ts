import rosetta from 'rosetta';

import type { RecursiveKeyOf, Translator } from '@/types/types';

import type { Locale } from './config';

export const clientTranslator = <T extends object>(
  locale: Locale,
  dictionary: T,
): Translator<T> => {
  const i18n = rosetta<Record<string, unknown>>();

  i18n.set(locale, dictionary as unknown as Record<string, unknown>);
  i18n.locale(locale);

  return ((key: RecursiveKeyOf<T>, params) =>
    i18n.t(key, params) as string) as Translator<T>;
};
