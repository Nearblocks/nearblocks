import { ReactElement, ReactNode, useEffect } from 'react';

import { Network } from 'nb-types';

import Navbar from '@/components/Header/Navbar';
import { getProviders } from '@/libs/rpc';
import { useNetworkStore } from '@/stores/network';
import { useRpcStore } from '@/stores/rpc';

import Footer from '../Footer';

interface LayoutProps {
  children: ReactNode;
  hideSearch?: boolean;
}

const Layout = ({ children, hideSearch }: LayoutProps) => {
  const setRpc = useRpcStore((state) => state.setRpc);
  const setNetwork = useNetworkStore((state) => state.setNetwork);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const rpcUrl = searchParams.get('rpcUrl');
    const network = searchParams.get('network');

    if (rpcUrl) {
      setRpc(rpcUrl);
    }
    if (network) {
      setNetwork(network as Network);
      setRpc(getProviders(network)?.[0]?.url);
    }
  }, [setRpc, setNetwork]);

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
