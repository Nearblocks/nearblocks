import { ErrorSuspense } from '@/components/error-suspense';
import { fetchStats } from '@/data/layout';

import { NetworkSwitcher } from './network';
import { NearPrice } from './price';
import { ThemeToggle } from './theme';

export const TopBar = () => {
  const statsPromise = fetchStats();

  return (
    <section className="bg-card border-border-secondary sticky top-0 right-0 left-0 z-50 hidden border-b lg:block">
      <div className="container mx-auto flex h-11 items-center px-4">
        <ErrorSuspense fallback={<NearPrice loading />}>
          <NearPrice statsPromise={statsPromise} />
        </ErrorSuspense>
        <div className="ml-auto flex gap-2">
          <NetworkSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </section>
  );
};
