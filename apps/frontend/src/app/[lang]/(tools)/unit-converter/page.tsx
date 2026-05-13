import type { Metadata } from 'next';

import { UnitConverterForm } from '@/components/tools/unit-converter/form';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/unit-converter'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'tools');

  return {
    alternates: { canonical: '/unit-converter' },
    description: t('units.subtitle'),
    title: t('units.title'),
  };
};

const UnitConverterPage = async () => {
  return (
    <div>
      <UnitConverterForm />
    </div>
  );
};

export default UnitConverterPage;
