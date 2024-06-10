import { ReactElement, ReactNode } from 'react';

import Navbar from '@/components/Header/Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <>
    <header className="lg:pt-9">
      <Navbar />
    </header>
    <main className="font-sans font-light text-text-body pb-9">{children}</main>
  </>
);

const MainLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default MainLayout;
