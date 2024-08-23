'use client';
import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
  notice?: ReactNode;
}

const Layout = ({ children, notice }: LayoutProps) => {
  const pathname = usePathname();
  const className =
    pathname === '/404'
      ? 'bg-white dark:bg-black-300'
      : 'bg-neargray-25 dark:bg-black-300	';

  return (
    <div className={className}>
      {notice}
      <header>
        <Header />
      </header>
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
