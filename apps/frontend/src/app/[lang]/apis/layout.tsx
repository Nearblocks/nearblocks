import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getDictionary, hasLocale, translator } from '@/locales/dictionaries';
import { LocaleProvider } from '@/providers/locale';

type Props = LayoutProps<'/[lang]/apis'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'apis');

  return {
    alternates: { canonical: '/apis' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const ApisLayout = async ({ children, params }: Props) => {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dictionary = await getDictionary(lang, ['apis']);

  return (
    <LocaleProvider dictionary={dictionary} locale={lang}>
      {children}
    </LocaleProvider>
  );
};

export default ApisLayout;
