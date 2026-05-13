import type { Metadata } from 'next';

import { StorageCostForm } from '@/components/tools/storage-cost/form';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/storage-cost'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'tools');

  return {
    alternates: { canonical: '/storage-cost' },
    description: t('storageCost.subtitle'),
    title: t('storageCost.title'),
  };
};

const StorageCostPage = async () => {
  return (
    <div>
      <StorageCostForm />
    </div>
  );
};

export default StorageCostPage;
