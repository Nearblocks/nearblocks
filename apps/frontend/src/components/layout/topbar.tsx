'use client';

import { usePathname } from 'next/navigation';

import { Stats } from 'nb-schemas';

import { ErrorSuspense } from '@/components/error-suspense';
import { SearchBar } from '@/components/search';
import { cn } from '@/lib/utils';

import { NetworkSwitcher } from './network';
import { NearPrice } from './price';
import { ThemeToggle } from './theme';

type Props = {
  statsPromise: Promise<null | Stats>;
};

export const TopBar = ({ statsPromise }: Props) => {
  const pathname = usePathname();
  const isHome = (pathname.match(/\//g) || []).length === 1;

  return (
    <section
      className={cn(
        'bg-card border-border-secondary sticky top-0 right-0 left-0 z-50 border-b',
        isHome ? 'hidden lg:block' : 'block',
      )}
    >
      <div className="container mx-auto flex h-11 items-center px-4">
        <ErrorSuspense fallback={<NearPrice loading />}>
          <NearPrice statsPromise={statsPromise} />
        </ErrorSuspense>
        <div className="ml-auto w-full lg:mr-2 lg:max-w-150">
          {!isHome && <SearchBar size="sm" />}
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <NetworkSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </section>
  );
};
