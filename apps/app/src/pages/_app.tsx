import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import '../../public/common.css';

import { useBosLoaderInitializer } from '@/hooks/useBosLoaderInitializer';
import type { NextPageWithLayout } from '@/utils/types';
import Script from 'next/script';
import { env } from 'next-runtime-env';
import { useTheme } from '@/hooks/useTheme';

const VmInitializer = dynamic(() => import('../components/vm/VmInitializer'), {
  ssr: false,
});

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};
export default function App({ Component, pageProps }: AppPropsWithLayout) {
  useBosLoaderInitializer();
  useTheme();

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtm.js?id=${env(
          'NEXT_PUBLIC_GTM_ID',
        )}`}
      />

      <VmInitializer />
      {getLayout(<Component {...pageProps} />)}
    </>
  );
}
