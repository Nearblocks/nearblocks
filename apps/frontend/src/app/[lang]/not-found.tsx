'use client';

import { SearchX } from 'lucide-react';

import { EmptyBox, EmptyFooter } from '@/components/empty';
import { useLocale } from '@/hooks/use-locale';

const NotFound = () => {
  const { t } = useLocale('layout');

  return (
    <main className="flex flex-1 flex-col py-10">
      <div className="bg-card container mx-auto flex flex-1 items-center justify-center rounded-lg">
        <EmptyBox
          description={t('errors.notFound.description')}
          icon={<SearchX />}
          title={t('errors.notFound.title')}
        >
          <EmptyFooter />
        </EmptyBox>
      </div>
    </main>
  );
};

export default NotFound;
