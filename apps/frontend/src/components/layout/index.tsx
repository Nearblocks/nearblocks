import { fetchStats, fetchSyncStatus } from '@/data/layout';

import { ErrorSuspense } from '../error-suspense';
import { ApiMigrationBanner } from './api-migration-banner';
import { Footer } from './footer';
import { Formbricks } from './formbricks';
import { Header } from './header';
import { NewUiBanner } from './new-ui-banner';
import { Notice } from './notice';
import { TopBar } from './topbar';

type Props = Readonly<{
  children: React.ReactNode;
}>;

export const Layout = ({ children }: Props) => {
  const statsPromise = fetchStats();
  const syncStatusPromise = fetchSyncStatus();

  return (
    <>
      <ApiMigrationBanner />
      <ErrorSuspense fallback={null}>
        <Notice syncStatusPromise={syncStatusPromise} />
      </ErrorSuspense>
      <NewUiBanner />
      <TopBar statsPromise={statsPromise} />
      <Header />
      {children}
      <Footer />
      <Formbricks />
      <svg
        aria-hidden
        className="absolute size-0"
        height="0"
        width="0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="highcharts-area-gradient-0"
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >
            <stop offset="0" stopColor="#0f5e59" stopOpacity={0.8} />
            <stop offset="1" stopColor="#0f5e59" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
};
