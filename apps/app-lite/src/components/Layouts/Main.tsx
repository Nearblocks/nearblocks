import { ReactElement, ReactNode, useEffect } from 'react';

import Navbar from '@/components/Header/Navbar';
import { useRpcStore } from '@/stores/rpc';

import Footer from '../Footer';

interface LayoutProps {
  children: ReactNode;
  hideSearch?: boolean;
}

const Layout = ({ children, hideSearch }: LayoutProps) => {
  const setRpc = useRpcStore((state) => state.setRpc);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const rpcUrl = searchParams.get('rpcUrl');
    if (rpcUrl) {
      setRpc(rpcUrl);
    }
  }, [setRpc]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="lg:pt-9">
        <Navbar hideSearch={hideSearch} />
      </header>
      <main className="font-sans font-light text-text-body pb-9">
        {children}
      </main>
      <footer className="pt-9 mt-auto">
        <Footer />
      </footer>
    </div>
  );
};

const MainLayout: React.FC<{
  children: ReactElement;
  hideSearch?: boolean;
}> = ({ children, hideSearch = false }) => (
  <Layout hideSearch={hideSearch}>{children}</Layout>
);

export default MainLayout;
