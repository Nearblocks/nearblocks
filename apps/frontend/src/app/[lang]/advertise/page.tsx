import { Metadata } from 'next';

import { Advertise } from '@/components/advertise';
import { hasLocale, translator } from '@/locales/dictionaries';

export const generateMetadata = async ({
  params,
}: PageProps<'/[lang]/advertise'>): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'advertise');

  return {
    alternates: { canonical: '/advertise' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const AdvertisePage = () => {
  return (
    <main className="flex flex-1 flex-col py-10">
      <div className="container mx-auto px-4">
        <Advertise />
      </div>
    </main>
  );
};

export default AdvertisePage;
