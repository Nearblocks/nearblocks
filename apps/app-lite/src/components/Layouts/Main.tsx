import { ReactElement, ReactNode } from 'react';

import Navbar from '@/components/Header/Navbar';

interface LayoutProps {
  children: ReactNode;
  hideSearch?: boolean;
}

const Layout = ({ children, hideSearch }: LayoutProps) => (
  <>
    <header className="lg:pt-9">
      <Navbar hideSearch={hideSearch} />
    </header>
    <main className="font-sans font-light text-text-body pb-9">{children}</main>
  </>
);

const MainLayout: React.FC<{
  children: ReactElement;
  hideSearch?: boolean;
}> = ({ children, hideSearch = false }) => (
  <Layout hideSearch={hideSearch}>{children}</Layout>
);

export default MainLayout;
