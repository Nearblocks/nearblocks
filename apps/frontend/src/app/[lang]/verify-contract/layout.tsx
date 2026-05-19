import { notFound } from 'next/navigation';

import { getDictionary, hasLocale } from '@/locales/dictionaries';
import { LocaleProvider } from '@/providers/locale';

type Props = LayoutProps<'/[lang]/verify-contract'>;

const VerifyContractLayout = async ({ children, params }: Props) => {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dictionary = await getDictionary(lang, ['address']);

  return (
    <LocaleProvider dictionary={dictionary} locale={lang}>
      {children}
    </LocaleProvider>
  );
};

export default VerifyContractLayout;
