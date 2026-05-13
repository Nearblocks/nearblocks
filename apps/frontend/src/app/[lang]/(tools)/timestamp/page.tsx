import type { Metadata } from 'next';

import { TimestampForm } from '@/components/tools/timestamp/form';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/timestamp'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'tools');

  return {
    alternates: { canonical: '/timestamp' },
    description: t('timestamp.subtitle'),
    title: t('timestamp.title'),
  };
};

const TimestampPage = async () => {
  return (
    <div>
      <TimestampForm />
    </div>
  );
};

export default TimestampPage;
