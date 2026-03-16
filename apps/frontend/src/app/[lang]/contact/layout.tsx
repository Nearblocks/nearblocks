import { notFound } from 'next/navigation';

import { hasLocale } from '@/locales/dictionaries';

type Props = LayoutProps<'/[lang]/contact'>;

const ContactLayout = async ({ children, params }: Props) => {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  return (
    <main className="flex flex-1 flex-col py-10">
      <div className="container mx-auto px-4">{children}</div>
    </main>
  );
};

export default ContactLayout;
