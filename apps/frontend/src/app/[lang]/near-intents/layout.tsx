import { notFound } from 'next/navigation';

import { getDictionary, hasLocale } from '@/locales/dictionaries';
import { LocaleProvider } from '@/providers/locale';

type Props = LayoutProps<'/[lang]/near-intents'>;

const NearIntentsLayout = async ({ children, params }: Props) => {
  const { lang } = await params;

  if (process.env.NEXT_PUBLIC_NETWORK_ID !== 'mainnet') notFound();
  if (!hasLocale(lang)) notFound();

  const dictionary = await getDictionary(lang, ['mts']);

  return (
    <LocaleProvider dictionary={dictionary} locale={lang}>
      <main className="flex flex-1 flex-col pt-4 pb-10">
        <div className="container mx-auto px-4">{children}</div>
      </main>
    </LocaleProvider>
  );
};

export default NearIntentsLayout;
