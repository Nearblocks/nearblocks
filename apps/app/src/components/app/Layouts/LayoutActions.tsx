'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import { ReactNode } from 'react';
import NextTopLoader from 'nextjs-toploader';
import { useThemeStore } from '@/stores/theme';
import { useTheme } from '@/hooks/app/useTheme';

interface LayoutProps {
  children: ReactNode;
  notice?: ReactNode;
  stats: any;
  blocks: any;
  handleFilterAndKeyword: any;
}

const LayoutActions = ({
  children,
  blocks,
  stats,
  notice,
  handleFilterAndKeyword,
}: LayoutProps) => {
  const pathname = usePathname();
  useTheme();
  const theme = useThemeStore((store) => store.theme);
  const className =
    pathname === '/404'
      ? 'bg-white dark:bg-black-300'
      : 'bg-neargray-25 dark:bg-black-300	';

  return (
    <div className={className}>
      <NextTopLoader
        color={`${(theme as string) === 'dark' ? '#31766A' : '#0D494A'}`}
      />
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

export default LayoutActions;
