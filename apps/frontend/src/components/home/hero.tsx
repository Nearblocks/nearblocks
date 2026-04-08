'use client';

import { SearchBar } from '@/components/search';
import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';

export const Hero = () => {
  const { t } = useLocale('home');
  const network = useConfig((s) => s.config.network);

  return (
    <div className="h-64 bg-[url(/images/wavey-bg.png)] bg-cover">
      <div className="container mx-auto px-4 pt-8 pb-8">
        <h1 className="dark:text-foreground text-headline-lg text-background mb-4 font-medium">
          {network === 'testnet' && 'TESTNET | '}
          {t('title')}
        </h1>
        <div className="max-w-200">
          <SearchBar />
        </div>
      </div>
    </div>
  );
};
