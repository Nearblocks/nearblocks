import { ReactElement, ReactNode, useEffect } from 'react';

import { Network } from 'nb-types';
import { getProviders } from '@/libs/rpc';
import { useNetworkStore } from '@/stores/network';
import { useRpcStore } from '@/stores/rpc';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
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
    <div className="min-h-screen">
      <main>{children}</main>
    </div>
  );
};

const MainLayout: React.FC<{
  children: ReactElement;
}> = ({ children }) => <Layout>{children}</Layout>;

export default MainLayout;
