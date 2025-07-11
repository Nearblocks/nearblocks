import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import '../../public/common.css';
import { MetaTags } from '@/components/MetaTags';
import type { NextPageWithLayout } from '@/utils/types';
import Script from 'next/script';

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const gTag = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-P285ZPV2';
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <MetaTags
        title="Near Explorer Selector"
        description="Explore the NEAR Blockchain for transactions, addresses, tokens, prices and other information."
      />
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gTag}`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gTag}');
          `}
      </Script>
      {getLayout(<Component {...pageProps} />)}
    </>
  );
}
