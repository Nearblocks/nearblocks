import { Metadata } from 'next';

import { Contact } from '@/components/contact';
import { hasLocale, translator } from '@/locales/dictionaries';

export const generateMetadata = async ({
  params,
}: PageProps<'/[lang]/contact'>): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'contact');

  return {
    alternates: { canonical: '/contact' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const ContactPage = async () => {
  return (
    <main className="flex flex-1 flex-col py-10">
      <div className="container mx-auto px-4">
        <Contact />
      </div>
    </main>
  );
};

export default ContactPage;
