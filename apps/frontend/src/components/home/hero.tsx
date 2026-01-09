'use client';

import { SearchBar } from '@/components/search';
import { useLocale } from '@/hooks/use-locale';

export const Hero = () => {
  const { t } = useLocale('home');

  return (
    <div className="text-white-950 h-57.5 bg-[url(/images/bg.png)] bg-cover">
      <div className="container mx-auto px-4 pt-10">
        <h1 className="text-headline-2xl">{t('title')}</h1>
        <SearchBar />
      </div>
    </div>
  );
};
