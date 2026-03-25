import { notFound } from 'next/navigation';

import { getDictionary, hasLocale } from '@/locales/dictionaries';
import { LocaleProvider } from '@/providers/locale';

type Props = LayoutProps<'/[lang]/apis'>;

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
