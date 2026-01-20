import { fetchStats } from '@/data/layout';

import { Footer } from './footer';
import { Header } from './header';
import { TopBar } from './topbar';

type Props = Readonly<{
  children: React.ReactNode;
}>;

export const Layout = ({ children }: Props) => {
  const statsPromise = fetchStats();

  return (
    <>
      {/* <Notice /> */}
      <TopBar statsPromise={statsPromise} />
      <Header />
      {children}
      <Footer />
    </>
  );
};
