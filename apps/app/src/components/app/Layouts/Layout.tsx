import 'react-toastify/dist/ReactToastify.css';
import { ReactNode } from 'react';
import { getRequest } from '@/utils/app/api';
import LayoutActions from './LayoutActions';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Manrope } from 'next/font/google';
import Script from 'next/script';
import { PublicEnvProvider } from 'next-runtime-env';
import { ToastContainer } from 'react-toastify';
import { cookies } from 'next/headers';

interface LayoutProps {
  children: ReactNode;
  notice?: ReactNode;
  locale: string;
}

const manrope = Manrope({
  weight: ['200', '300', '400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
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
      blocks: [],
      txns: [],
      accounts: [],
      receipts: [],
    };

    if (res?.blocks?.length) {
      if (returnPath) {
        return { type: 'block', path: res.blocks[0].block_hash };
      }
      data.blocks = res.blocks;
    }

    if (res?.txns?.length) {
      if (returnPath) {
        return { type: 'txn', path: res.txns[0].transaction_hash };
      }
      data.txns = res.txns;
    }

    if (res?.receipts?.length) {
      if (returnPath) {
        return {
          type: 'txn',
          path: res.receipts[0].originated_from_transaction_hash,
        };
      }
      data.receipts = res.receipts;
    }

    if (res?.accounts?.length) {
      if (returnPath) {
        return { type: 'address', path: res.accounts[0].account_id };
      }
      data.accounts = res.accounts;
    }

    return returnPath ? null : data;
  };

  return (
    <html
      className={`${manrope.className} ${theme}`}
      suppressHydrationWarning
      lang="en"
    >
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple_touch_icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon_32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon_16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <Script src="/__ENV.js" />
      </head>
      <body className={`overflow-x-hidden dark:bg-black-300`}>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
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
              stats={stats}
              blocks={blocks}
              handleFilterAndKeyword={handleFilterAndKeyword}
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
