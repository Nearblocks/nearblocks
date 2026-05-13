import type { Metadata } from 'next';

import { ShardMapperForm } from '@/components/tools/shard-mapper/form';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/shard-mapper'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'tools');

  return {
    alternates: { canonical: '/shard-mapper' },
    description: t('shard.subtitle'),
    title: t('shard.title'),
  };
};

const ShardMapperPage = async () => {
  return (
    <div>
      <ShardMapperForm />
    </div>
  );
};

export default ShardMapperPage;
