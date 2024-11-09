import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { PublicEnvProvider } from 'next-runtime-env';
import { Manrope } from 'next/font/google';
import { cookies } from 'next/headers';
import Script from 'next/script';
import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getRequest } from '@/utils/app/api';

import LayoutActions from './LayoutActions';

interface LayoutProps {
  children: ReactNode;
  locale: string;
  notice?: ReactNode;
}

const manrope = Manrope({
  display: 'swap',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600'],
});

const Layout = async ({ children }: LayoutProps) => {
  const messages = await getMessages();
  const theme = cookies().get('theme')?.value || 'light';
  const [stats, blocks] = await Promise.all([
    getRequest(`stats`),
    getRequest(`blocks/latest?limit=1`),
  ]);

  const handleFilterAndKeyword = async (
    keyword: string,
    filter: string,
    returnPath: any,
  ) => {
    'use server';

    if (keyword.includes('.')) {
      keyword = keyword.toLowerCase();
    }

    const res = await getRequest(`search${filter}?keyword=${keyword}`);

    const data = {
      accounts: [],
      blocks: [],
      receipts: [],
      txns: [],
    };

    if (res?.blocks?.length) {
      if (returnPath) {
        return { path: res.blocks[0].block_hash, type: 'block' };
      }
      data.blocks = res.blocks;
    }

    if (res?.txns?.length) {
      if (returnPath) {
        return { path: res.txns[0].transaction_hash, type: 'txn' };
      }
      data.txns = res.txns;
    }

    if (res?.receipts?.length) {
      if (returnPath) {
        return {
          path: res.receipts[0].originated_from_transaction_hash,
          type: 'txn',
        };
      }
      data.receipts = res.receipts;
    }

    if (res?.accounts?.length) {
      if (returnPath) {
        return { path: res.accounts[0].account_id, type: 'address' };
      }
      data.accounts = res.accounts;
    }

    return returnPath ? null : data;
  };

  return (
    <html
      className={`${manrope.className} ${theme}`}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link
          href="/apple_touch_icon.png"
          rel="apple-touch-icon"
          sizes="180x180"
        />
        <link
          href="/favicon_32x32.png"
          rel="icon"
          sizes="32x32"
          type="image/png"
        />
        <link
          href="/favicon_16x16.png"
          rel="icon"
          sizes="16x16"
          type="image/png"
        />
        <link href="/site.webmanifest" rel="manifest" />
        <Script src="/__ENV.js" />
      </head>
      <body className={`overflow-x-hidden dark:bg-black-300`}>
        <noscript>
          <iframe
            height="0"
            src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
            style={{ display: 'none', visibility: 'hidden' }}
            width="0"
          />
        </noscript>
        <Script id="gtm" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),
                  dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
          `}
        </Script>
        <PublicEnvProvider>
          <NextIntlClientProvider messages={messages}>
            <ToastContainer />
            <LayoutActions
              blocks={blocks}
              handleFilterAndKeyword={handleFilterAndKeyword}
              stats={stats}
              theme={theme}
            >
              {children}
            </LayoutActions>
          </NextIntlClientProvider>
        </PublicEnvProvider>
      </body>
    </html>
  );
};

export default Layout;
