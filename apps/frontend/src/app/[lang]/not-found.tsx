'use client';

import { LuSearchX } from 'react-icons/lu';

import { EmptyBox, EmptyFooter } from '@/components/empty';
import { useLocale } from '@/hooks/use-locale';

const NotFound = () => {
  const { t } = useLocale('layout');

  return (
    <main className="flex flex-1 flex-col py-10">
      <div className="bg-card container mx-auto flex flex-1 items-center justify-center rounded-lg">
        <EmptyBox
          description={t('errors.notFound.description')}
          icon={<LuSearchX />}
          title={t('errors.notFound.title')}
        >
          <EmptyFooter />
        </EmptyBox>
      </div>
    </main>
  );
};

export default NotFound;
