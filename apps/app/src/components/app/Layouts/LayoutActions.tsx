'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import { ReactNode } from 'react';
import NextTopLoader from 'nextjs-toploader';

interface LayoutProps {
  children: ReactNode;
  notice?: ReactNode;
  stats: any;
  blocks: any;
  handleFilterAndKeyword: any;
  theme?: string;
}

const LayoutActions = ({
  children,
  blocks,
  stats,
  notice,
  handleFilterAndKeyword,
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
      <header>
        <Header
          stats={stats}
          block={blocks}
          handleFilterAndKeyword={handleFilterAndKeyword}
          theme={theme}
        />
      </header>
      <main>{children}</main>
      <Footer theme={theme} />
    </div>
  );
};

export default LayoutActions;
