import { notFound } from 'next/navigation';

import { getDictionary, hasLocale } from '@/locales/dictionaries';
import { LocaleProvider } from '@/providers/locale';

type Props = LayoutProps<'/[lang]/nft-tokens'>;

const NftTokensLayout = async ({ children, params }: Props) => {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dictionary = await getDictionary(lang, ['nfts']);

  return (
    <LocaleProvider dictionary={dictionary} locale={lang}>
      <main className="flex flex-1 flex-col pt-6 pb-10">
        <div className="container mx-auto px-4">{children}</div>
      </main>
    </LocaleProvider>
  );
};

export default NftTokensLayout;
