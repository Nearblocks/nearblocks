import type { Metadata } from 'next';

import { KeypairForm } from '@/components/tools/keypair/form';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/keypair'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'tools');

  return {
    alternates: { canonical: '/keypair' },
    description: t('keypair.subtitle'),
    title: t('keypair.title'),
  };
};

const KeypairPage = async () => {
  return (
    <div>
      <KeypairForm />
    </div>
  );
};

export default KeypairPage;
