import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';

import { MetaTags } from '@/components/MetaTags';
import { useBosLoaderInitializer } from '@/hooks/useBosLoaderInitializer';
import type { NextPageWithLayout } from '@/utils/types';

const VmInitializer = dynamic(() => import('../components/vm/VmInitializer'), {
  ssr: false,
});

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  useBosLoaderInitializer();

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <MetaTags
        title="Explorer Selector"
        description="Explore the NEAR Blockchain for transactions, addresses, tokens, prices and other information."
      />
      <VmInitializer />

      {getLayout(<Component {...pageProps} />)}
    </>
  );
}
