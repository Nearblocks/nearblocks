import Image from 'next/image';

import { hasLocale, translator } from '@/locales/dictionaries';

const AboutPage = async ({ params }: PageProps<'/[lang]/about'>) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'about');

  return (
    <main className="flex flex-1 flex-col py-10">
      <div className="bg-card container mx-auto flex flex-1 items-center justify-center rounded-lg px-4 py-10">
        <div className="text-center">
          <h1 className="text-headline-2xl mb-6">{t('title')}</h1>
          <p className="text-muted-foreground mx-auto mb-10 max-w-3xl text-balance">
            {t('description')}
          </p>
          <Image
            alt="community"
            className="mx-auto"
            height={348}
            src="/images/world-link.png"
            width={618}
          />
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
