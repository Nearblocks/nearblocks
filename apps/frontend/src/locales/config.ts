export const supportedLocales = [
  'en',
  'es',
  'fil-ph',
  'fr',
  'id',
  'it',
  'ja',
  'ko',
  'ru',
  'th',
  'uk',
  'vi',
  'zh-cn',
  'zh-hk',
] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = 'en';
