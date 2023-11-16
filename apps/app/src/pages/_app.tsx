import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import '../../public/common.css';

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
        title="Near Protocol Explorer | NearBlocks"
        description="Near Blocks is a Block Explorer and Analytics Platform for Near blockchain (Ⓝ), a new blockchain and smart transaction platform."
      />
      <VmInitializer />

      {getLayout(<Component {...pageProps} />)}
    </>
  );
}
