import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { PublicEnvProvider } from 'next-runtime-env';
import { ThemeProvider } from 'next-themes';
import { cookies } from 'next/headers';
import Script from 'next/script';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { manrope } from '@/fonts/font';
import { GTMID, networkId } from '@/utils/app/config';

import LayoutActions from './LayoutActions';
import ThemeInitializer from './ThemeInitializer';
import { getRequest } from '@/utils/app/api';
import { AddressHoverProvider } from '@/components/app/common/HoverContextProvider';
import { getCookie } from '@/utils/app/actions';

interface LayoutProps {
  children: React.ReactNode;
  locale: string;
  notice?: React.ReactNode;
}

const Layout = async ({ children, locale }: LayoutProps) => {
  const messages = await getMessages();
  const theme = (await cookies()).get('theme')?.value || 'light';
  const token = await getCookie('token');
  const network = networkId;

  const getLatestStats = async () => {
    'use server';
    const statsDetails = await getRequest(`stats`);
    return statsDetails?.stats?.[0];
  };

  const getSyncStatus = async () => {
    'use server';
    const sync = await getRequest('sync/status');
    const indexers = sync?.status?.indexers;
    return indexers;
  };

  const stats = await getLatestStats();
  const indexers = await getSyncStatus();

  return (
    <html
      className={`${manrope.className} ${theme}`}
      lang={locale}
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
        <link
          rel="search"
          type="application/opensearchdescription+xml"
          href={
            network === 'testnet'
              ? '/opensearch_testnet.xml'
              : '/opensearch_mainnet.xml'
          }
          title="nearblocks"
        />
      </head>
      <body className={`overflow-x-hidden dark:bg-black-300`}>
        <noscript>
          <iframe
            height="0"
            src={`https://www.googletagmanager.com/ns.html?id=${GTMID}`}
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
            })(window,document,'script','dataLayer','${GTMID}');
          `}
        </Script>
        <PublicEnvProvider>
          <NextIntlClientProvider messages={messages}>
            <AddressHoverProvider>
              <ThemeProvider attribute="class" defaultTheme={theme}>
                <ThemeInitializer initialTheme={theme} />
                <ToastContainer />
                <LayoutActions
                  theme={theme}
                  token={token}
                  stats={stats}
                  sync={indexers}
                  getLatestStats={getLatestStats}
                  getSyncStatus={getSyncStatus}
                >
                  {children}
                </LayoutActions>
              </ThemeProvider>
            </AddressHoverProvider>
          </NextIntlClientProvider>
        </PublicEnvProvider>
      </body>
    </html>
  );
};

export default Layout;
