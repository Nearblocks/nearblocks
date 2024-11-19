'use client';
import { usePathname } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';

import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  notice?: React.ReactNode;
  theme?: string;
}

const LayoutActions = ({ children, notice, theme }: LayoutProps) => {
  const pathname = usePathname();

  const className =
    pathname === '/404'
      ? 'bg-white dark:bg-black-300'
      : 'bg-neargray-25 dark:bg-black-300	';

  return (
    <div className={className}>
      <NextTopLoader
        color={`${(theme as string) ? '#31766A' : '#0D494A'}`}
        showSpinner={false}
      />
      {notice}
      <main>{children}</main>
      <Footer theme={theme} />
    </div>
  );
};

export default LayoutActions;
