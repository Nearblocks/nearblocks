'use client';
import { usePathname } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import { ReactNode } from 'react';

import Footer from './Footer';
import Header from './Header';

interface LayoutProps {
  blocks: any;
  children: ReactNode;
  handleFilterAndKeyword: any;
  notice?: ReactNode;
  stats: any;
  theme?: string;
}

const LayoutActions = ({
  blocks,
  children,
  handleFilterAndKeyword,
  notice,
  stats,
  theme,
}: LayoutProps) => {
  const pathname = usePathname();

  const className =
    pathname === '/404'
      ? 'bg-white dark:bg-black-300'
      : 'bg-neargray-25 dark:bg-black-300	';

  return (
    <div className={className}>
      <NextTopLoader color={`${(theme as string) ? '#31766A' : '#0D494A'}`} />
      {notice}

      <Header
        block={blocks}
        handleFilterAndKeyword={handleFilterAndKeyword}
        stats={stats}
        theme={theme}
      />

      <main>{children}</main>
      <Footer theme={theme} />
    </div>
  );
};

export default LayoutActions;
