'use client';

import { SearchBar } from '@/components/search';
import { useLocale } from '@/hooks/use-locale';

export const Hero = () => {
  const { t } = useLocale('home');

  return (
    <div className="h-64 bg-[url(/images/wavey_bg.png)] bg-cover">
      <div className="container mx-auto px-4 pt-10 pb-8">
        <h1 className="dark:text-foreground text-headline-lg font-medium text-[#ffffff]">
          {t('title')}
        </h1>
        <SearchBar />
      </div>
    </div>
  );
};
