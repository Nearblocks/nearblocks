import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { ToolsSidebar } from '@/components/tools/sidebar';
import { getDictionary, hasLocale } from '@/locales/dictionaries';
import { LocaleProvider } from '@/providers/locale';

type Props = {
  children: ReactNode;
  params: Promise<{ lang: string }>;
};

const ToolsLayout = async ({ children, params }: Props) => {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dictionary = await getDictionary(lang, ['tools']);

  return (
    <LocaleProvider dictionary={dictionary} locale={lang}>
      <div className="container mx-auto flex flex-col gap-6 px-4 py-8 md:flex-row md:gap-8">
        <ToolsSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </LocaleProvider>
  );
};

export default ToolsLayout;
