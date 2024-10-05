'use client';
import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
  notice?: ReactNode;
  stats: any;
  blocks: any;
  handleFilterAndKeyword: any;
}

const Layout = ({
  children,
  notice,
  stats,
  blocks,
  handleFilterAndKeyword,
}: LayoutProps) => {
  const pathname = usePathname();
  const className =
    pathname === '/404'
      ? 'bg-white dark:bg-black-300'
      : 'bg-neargray-25 dark:bg-black-300	';

  return (
    <div className={className}>
      {notice}
      <header>
        <Header
          stats={stats}
          block={blocks}
          handleFilterAndKeyword={handleFilterAndKeyword}
        />
      </header>
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
