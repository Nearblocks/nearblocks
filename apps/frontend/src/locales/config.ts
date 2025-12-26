export const supportedLocales = [
  'en',
  'es',
  'fr',
  'id',
  'it',
  'jp',
  'kr',
  'ph',
  'ru',
  'th',
  'ua',
  'vi',
  'zh-cn',
  'zh-hk',
] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = 'en';
