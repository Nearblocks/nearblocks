import { Suspense } from 'react';

import { fetchStats, fetchSyncStatus } from '@/data/layout';

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
      <Suspense fallback={null}>
        <Notice syncStatusPromise={syncStatusPromise} />
      </Suspense>
      <NewUiBanner />
      <TopBar statsPromise={statsPromise} />
      <Header />
      {children}
      <Footer />
      <Formbricks />
    </>
  );
};
