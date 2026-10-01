'use client';

import { SearchBar } from '@/components/search';
import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';

export const Hero = () => {
  const { t } = useLocale('home');
  const network = useConfig((s) => s.config.network);

  return (
    <div className="flex h-60 items-center bg-[url(/images/wavey-bg.png)] bg-cover">
      <div className="container mx-auto px-4">
        <h1 className="mb-4 text-headline-xl font-medium text-background dark:text-foreground">
          {network === 'testnet' && 'TESTNET | '}
          {t('title')}
        </h1>
        <div className="max-w-full md:max-w-3/5">
          <SearchBar />
        </div>
        <p className="mt-4 text-body-sm">&nbsp;</p>
      </div>
    </div>
  );
};
