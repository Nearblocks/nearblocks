import type { Metadata } from 'next';

import { Base64Form } from '@/components/tools/base64/form';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/base64'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'tools');

  return {
    alternates: { canonical: '/base64' },
    description: t('base64.subtitle'),
    title: t('base64.title'),
  };
};

const Base64Page = async () => {
  return (
    <div>
      <Base64Form />
    </div>
  );
};

export default Base64Page;
