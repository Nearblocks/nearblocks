import { ReactElement, ReactNode, useEffect } from 'react';

import Navbar from '@/components/Header/Navbar';
import { useRpcStore } from '@/stores/rpc';

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
    <>
      <header className="lg:pt-9">
        <Navbar hideSearch={hideSearch} />
      </header>
      <main className="font-sans font-light text-text-body pb-9">
        {children}
      </main>
    </>
  );
};

const MainLayout: React.FC<{
  children: ReactElement;
  hideSearch?: boolean;
}> = ({ children, hideSearch = false }) => (
  <Layout hideSearch={hideSearch}>{children}</Layout>
);

export default MainLayout;
