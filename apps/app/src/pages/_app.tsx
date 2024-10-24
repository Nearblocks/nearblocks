import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import '../../public/common.css';

import type { NextPageWithLayout } from '@/utils/types';
import Script from 'next/script';
import { env } from 'next-runtime-env';
import { ThemeProvider } from 'next-themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};
export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Script id="gtm">
        {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${env('NEXT_PUBLIC_GTM_ID')}');
      `}
      </Script>
      <ThemeProvider attribute="class" enableSystem={false}>
        <ToastContainer />
        {getLayout(<Component {...pageProps} />)}
      </ThemeProvider>
    </>
  );
}
