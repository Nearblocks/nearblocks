import rosetta from 'rosetta';

import type {
  BaseDictionary,
  DeepPartial,
  RecursiveKeyOf,
  RouteDictionary,
  RouteKey,
  RouteNamespace,
  Translator,
} from '@/types/types';

import { type Locale, supportedLocales } from './config';

const dictionaries: Record<Locale, () => Promise<BaseDictionary>> = {
  en: () => import('./en').then((module) => module.dictionary),
  es: () => import('./es').then((module) => module.dictionary),
  'fil-ph': () => import('./fil-ph').then((module) => module.dictionary),
  fr: () => import('./fr').then((module) => module.dictionary),
  id: () => import('./id').then((module) => module.dictionary),
  it: () => import('./it').then((module) => module.dictionary),
  ja: () => import('./ja').then((module) => module.dictionary),
  ko: () => import('./ko').then((module) => module.dictionary),
  ru: () => import('./ru').then((module) => module.dictionary),
  th: () => import('./th').then((module) => module.dictionary),
  uk: () => import('./uk').then((module) => module.dictionary),
  vi: () => import('./vi').then((module) => module.dictionary),
  'zh-cn': () => import('./zh-cn').then((module) => module.dictionary),
  'zh-hk': () => import('./zh-hk').then((module) => module.dictionary),
};

export const hasLocale = (locale: string): locale is Locale =>
  supportedLocales.includes(locale as Locale);

export const getDictionary = async (
  locale: Locale,
  namespaces?: RouteNamespace[],
): Promise<DeepPartial<BaseDictionary>> => {
  const dict = await dictionaries[locale]();
  if (namespaces) {
    const result: DeepPartial<BaseDictionary> = {};
    namespaces.forEach((namespace) => {
      result[namespace] = dict[namespace];
    });
    return result;
  }
  return dict;
};

export const translator = async <R extends RouteNamespace>(
  locale: Locale,
  route: R,
): Promise<Translator<RouteDictionary<R>>> => {
  const dictionary = await getDictionary(locale);
  const i18n = rosetta<Record<string, unknown>>();

  i18n.set(locale, dictionary);
  i18n.locale(locale);

  return ((key: RouteKey<R>, params) =>
    i18n.t(`${route}.${key}`, params) as string) as Translator<
    RouteDictionary<R>
  >;
};

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
