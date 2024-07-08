import { ReactElement, ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <>
    <main>{children}</main>
  </>
);

const MainLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default MainLayout;
