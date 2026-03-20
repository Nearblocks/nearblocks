import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getDictionary, hasLocale, translator } from '@/locales/dictionaries';
import { LocaleProvider } from '@/providers/locale';

type Props = LayoutProps<'/[lang]/txns'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'txns');
  return {
    alternates: { canonical: '/txns' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const TxnsLayout = async ({ children, params }: Props) => {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dictionary = await getDictionary(lang, ['txns']);

  return (
    <LocaleProvider dictionary={dictionary} locale={lang}>
      <main className="flex flex-1 flex-col pt-6 pb-10">
        <div className="container mx-auto px-4">{children}</div>
      </main>
    </LocaleProvider>
  );
};

export default TxnsLayout;
