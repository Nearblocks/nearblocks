import type { Metadata } from 'next';

import { GasConverterForm } from '@/components/tools/gas-converter/form';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/gas-converter'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'tools');

  return {
    alternates: { canonical: '/gas-converter' },
    description: t('gas.subtitle'),
    title: t('gas.title'),
  };
};

const GasConverterPage = async () => {
  return (
    <div>
      <GasConverterForm />
    </div>
  );
};

export default GasConverterPage;
