'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';

import { getMessage, getCookie } from '@/utils/app/actions';
import useWallet from '@/hooks/app/useWallet';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';

import ThemeInitializer from '@/components/app/Layouts/ThemeInitializer';
import { NearContext } from '@/components/app/wallet/near-context';
import { AddressHoverProvider } from '@/components/app/common/HoverContextProvider';
import Header from '@/components/app/Layouts/Header';
import Footer from '@/components/app/Layouts/Footer';

const fallbackMessages = {
  header: {
    menu: {
      home: 'Home',
      blockchain: 'Blockchain',
      charts: 'Charts & Stats',
      nodeExplorer: 'Node Explorer',
      tokens: 'Tokens',
      topAccounts: 'Top Accounts',
      topnft: 'Top NFT Tokens',
      toptoken: 'Top Tokens',
      viewBlocks: 'View Blocks',
      viewNftTrasfers: 'NFT Token Transfers',
      viewTokenTrasfers: 'Token Transfers',
      viewTxns: 'View Txns',
      languages: 'Languages',
    },
  },
  footer: {
    description:
      'NEAR Blocks is the leading blockchain explorer dedicated to the NEAR ecosystem. Powered by NEAR Protocol',
    poweredBy: 'Powered by',
    links: {
      about: 'About',
      advertise: 'Advertise',
      api: 'NEAR Indexer APIs',
      blockExplorer: 'Block Explorer',
      buySell: 'Buy, Sell & Trade',
      charts: 'Charts & Stats',
      company: 'Company',
      contact: 'Contact',
      explore: 'Explore',
      fundamentals: 'Fundamentals',
      kb: 'Knowledge Base',
      latestBlocks: 'Latest Blocks',
      latestTxns: 'Latest Transactions',
      nearValidator: 'NEAR Validator list',
      terms: 'Terms',
    },
  },
  trademark: `NearBlocks is operated full and on it's own. NearBlocks is not associated to The NEAR Foundation and every licensed trademark displayed on this website belongs to their respective owners.`,
};

const ErrorContent = ({ reset }: { reset: () => void }) => (
  <>
    <div className="text-center text-nearblue-600 dark:text-neargray-10 mt-4">
      Sorry, we encountered an unexpected error. Please try again later.
    </div>
    <div className="text-center text-nearblue-600 dark:text-neargray-10 mt-2">
      If you think this is a problem,{' '}
      <Link
        className="text-green-100 hover:text-green-200 underline"
        href="/contact"
      >
        please tell us
      </Link>
    </div>
    <div className="flex justify-center pt-8 z-10">
      <button
        className="bg-green-500 dark:bg-green-250 hover:bg-green-200 text-white text-xs py-2 rounded focus:outline-none text-center px-3 w-auto"
        onClick={() => reset()}
      >
        Refresh
      </button>
    </div>
  </>
);

export default function ErrorLayout({ reset }: { reset: () => void }) {
  const wallet = useWallet();
  const [messages, setMessages] = useState<any>(null);

  const [signedAccountId, setSignedAccountId] = useState<any>(null);
  const [path, setPath] = useState<string | null>(null);

  const theme = Cookies.get('theme') || 'light';
  const locale = Cookies.get('NEXT_LOCALE') || 'en';

  useEffect(() => {
    setPath(window.location.pathname);
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [messages, signedAccountId] = await Promise.all([
          getMessage(),
          getCookie('signedAccountId'),
        ]);
        setMessages(messages);
        setSignedAccountId(signedAccountId);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    const initWallet = async () => {
      if (wallet && !wallet.selector) {
        const accountId = await wallet.startUp(setSignedAccountId);
        setSignedAccountId(accountId);
      }
    };
    initWallet();
  }, [wallet]);

  return (
    <NextIntlClientProvider
      messages={messages || fallbackMessages}
      locale={locale}
    >
      <AddressHoverProvider>
        <ThemeProvider attribute="class">
          <ThemeInitializer initialTheme={theme} />

          <NearContext.Provider value={{ signedAccountId, wallet }}>
            <Header
              accountId={signedAccountId}
              pathname={path}
              theme={theme}
              ShowSearch={true}
              locale={locale}
            />

            <section className="flex flex-col items-center justify-center relative bg-white dark:bg-black-500 h-[725px]">
              <div className="globalErrorContainer flex flex-col items-center justify-end relative ">
                <div className="px-3 errorContent absolute flex flex-col justify-center mb-0">
                  <div className="text-center text-nearblue-600 dark:text-neargray-10 text-3xl pt-20 font-semibold">
                    Server Error
                  </div>
                  <ErrorContent reset={reset} />
                </div>
                <div className="absolute top-[250px] errorBg !mt-0"></div>
              </div>
            </section>

            <Footer theme={theme} />
          </NearContext.Provider>
        </ThemeProvider>
      </AddressHoverProvider>
    </NextIntlClientProvider>
  );
}
