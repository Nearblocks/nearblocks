'use client';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { useConfig } from '@/hooks/app/useConfig';
import { Link, routing, usePathname } from '@/i18n/routing';
import { nanoToMilli } from '@/utils/app/libs';
import { dollarFormat } from '@/utils/libs';

import ActiveLink from '@/components/app/ActiveLink';
import Collapse from '@/components/app/Collapse';
import Search from '@/components/app/common/Search';
import ArrowDown from '@/components/app/Icons/ArrowDown';
import Menu from '@/components/app/Icons/Menu';
import UserMenu from '@/components/app/Layouts/UserMenu';
import useStatsStore from '@/stores/app/syncStats';
import { getLatestStats, getSyncStatus } from '@/utils/app/actions';
import useFallbackPathname from '@/hooks/app/useFallbackPathname';

const menus = [
  {
    fallbackText: 'Home',
    id: 1,
    link: '/',
    submenu: [],
    title: 'header.menu.home',
  },
  {
    fallbackText: 'Blockchain',
    id: 2,
    submenu: [
      {
        fallbackText: 'View Blocks',
        id: 1,
        link: '/blocks',
        title: 'header.menu.viewBlocks',
      },
      {
        fallbackText: 'View Transactions',
        id: 2,
        link: '/txns',
        title: 'header.menu.viewTxns',
      },
      {
        fallbackText: 'Charts',
        id: 4,
        link: '/charts',
        title: 'header.menu.charts',
      },
      {
        fallbackText: 'Node Explorer',
        id: 5,
        link: '/node-explorer',
        title: 'header.menu.nodeExplorer',
      },
      {
        fallbackText: 'Multichain Txns',
        id: 6,
        link: '/multichain-txns',
      },
    ],
    title: 'header.menu.blockchain',
  },
  {
    fallbackText: 'Tokens',
    id: 3,
    submenu: [
      {
        fallbackText: 'Top Tokens',
        id: 1,
        link: '/tokens',
        title: 'header.menu.toptoken',
      },
      {
        fallbackText: 'View Token Transfers',
        id: 2,
        link: '/tokentxns',
        title: 'header.menu.viewTokenTrasfers',
      },
      {
        fallbackText: 'Top NFTs',
        id: 3,
        link: '/nft-tokens',
        title: 'header.menu.topnft',
      },
      {
        fallbackText: 'View NFT Transfers',
        id: 4,
        link: '/nft-tokentxns',
        title: 'header.menu.viewNftTrasfers',
      },
    ],
    title: 'header.menu.tokens',
  },
];

const languages = [
  { locale: 'en', title: 'English' },
  {
    locale: 'kr',
    title: '한국어',
  },
  {
    locale: 'id',
    title: 'Bahasa',
  },
  {
    locale: 'zh-cn',
    title: '汉语 (Simplified)',
  },
  {
    locale: 'zh-hk',
    title: '漢語 (Traditional)',
  },
  {
    locale: 'ua',
    title: 'Українська',
  },
  {
    locale: 'ru',
    title: 'Русский',
  },
  {
    locale: 'vi',
    title: 'Tiếng Việt',
  },
  {
    locale: 'es',
    title: 'Español',
  },
  {
    locale: 'fr',
    title: 'Français',
  },
  {
    locale: 'jp',
    title: '日本語',
  },
  {
    locale: 'ph',
    title: 'Filipino',
  },
  {
    locale: 'th',
    title: 'ภาษาไทย',
  },
  {
    locale: 'it',
    title: 'Italiano',
  },
];

const Header = ({
  stats: initialStats,
  sync: initialSync,
  accountId,
  theme: cookieTheme,
  locale,
  globalError,
}: any) => {
  const [open, setOpen] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState(true);
  const [stats, setStats] = useState(initialStats);
  const [sync, setSync] = useState<string>(initialSync?.base?.timestamp);
  const setLatestStats = useStatsStore((state) => state.setLatestStats);
  const setSyncStat = useStatsStore((state) => state.setSyncStatus);
  useEffect(() => {
    if (initialStats) {
      setSyncStat(initialSync);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fallbackPathname = useFallbackPathname();
  const currentPathname = usePathname();
  const localeList = languages.map((lang) => lang.locale);
  const pathname =
    (globalError ? fallbackPathname : currentPathname)?.replace(
      new RegExp(`^/(${localeList.join('|')})(?=/|$)`),
      '',
    ) || '/';

  useEffect(() => {
    const fetchSyncStats = async () => {
      try {
        const resp = await getSyncStatus();
        const syncTimestamp = resp?.indexers?.base?.timestamp;
        if (typeof syncTimestamp === 'string') {
          setSync(syncTimestamp);
        }
        if (resp?.indexers) {
          setSyncStat(resp?.indexers);
        }
      } catch (error) {
        console.error('Error fetching syncStats:', error);
      }
    };
    fetchSyncStats();
    const syncInterval = setInterval(() => {
      fetchSyncStats();
    }, 180000);

    return () => {
      clearInterval(syncInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const fetchLatestStats = async () => {
      try {
        const statsDetails = await getLatestStats();
        if (statsDetails) {
          setStats(statsDetails);
          setLatestStats(statsDetails);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchLatestStats();
    const statsInterval = setInterval(() => {
      fetchLatestStats();
    }, 60000);

    return () => {
      clearInterval(statsInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const nearPrice = stats?.near_price ?? '';
  const t = useTranslations();
  const { networkId } = useConfig();
  let { setTheme, theme } = useTheme();

  if (theme == undefined) {
    theme = cookieTheme;
  }

  useEffect(() => {
    if (sync) {
      const timestamp = nanoToMilli(sync);

      const utcDate = Date.parse(new Date(timestamp).toISOString());
      const currentTime = Date.now();

      if ((currentTime - utcDate) / (1000 * 60) > 10) {
        return setSyncStatus(false);
      }
    }
    return setSyncStatus(true);
  }, [sync]);

  // const showSearch = pathname !== '/';
  const showSearch = !!globalError || pathname !== '/';

  useEffect(() => {
    const cookieTheme = Cookies.get('theme');
    if (cookieTheme && cookieTheme !== theme) {
      setTheme(cookieTheme);
    }
  }, [theme, setTheme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    Cookies.set('theme', newTheme, { expires: 365, path: '/' });
    setTheme(newTheme);
  };

  const IntlLink = (props: any) => {
    if (!routing?.locales?.includes(props.locale)) {
      console.error(`Invalid locale: ${props.locale}`);
      return null;
    }
    const setLocaleCookie = () => {
      Cookies.set('NEXT_LOCALE', props.locale, {
        expires: 365,
        path: '/',
        sameSite: 'lax',
      });
    };

    return <Link onClick={setLocaleCookie} {...props} />;
  };

  return (
    <>
      {!syncStatus && (
        <div className="flex flex-wrap">
          <div className="flex items-center justify-center text-center w-full  border-b-2 border-nearblue bg-nearblue dark:border-black-200 dark:bg-black-200 py-2 text-green dark:text-green-250 text-sm ">
            {t('outofSync') ||
              'This blockchain explorer is out of sync. Some blocks or transactions may be delayed.'}
          </div>
        </div>
      )}
      <div
        className={`${
          !showSearch && 'hidden'
        } md:!flex w-full sticky top-0 dark:bg-black-600 bg-white p-0.5 z-50 justify-center border-b-[1px] dark:border-gray-800`}
      >
        <div className="container-xxl w-full mx-auto flex justify-between">
          <div className="hidden md:!flex md:!w-[35%] h-10">
            <div className="dark:!bg-black-600 h-full w-32 flex items-center">
              <div className="h-11 flex items-center">
                {networkId === 'mainnet' && nearPrice ? (
                  <div className="h-full py-1 rounded-lg flex justify-center items-center w-52">
                    <p className="text-xs text-gray-500 dark:text-neargray-10 font-medium leading-6 px-1 whitespace-nowrap">
                      NEAR Price:
                    </p>
                    <p className="text-xs text-gray-500 dark:text-neargray-10 font-medium leading-6 px-1">
                      $
                      {stats?.near_price
                        ? dollarFormat(stats?.near_price)
                        : stats?.near_price ?? ''}
                    </p>
                    {Number(stats?.change_24) > 0 ? (
                      <>
                        <span className="text-neargreen text-xs">
                          (+
                          {stats?.change_24
                            ? dollarFormat(stats?.change_24)
                            : stats?.change_24 ?? ''}
                          %)
                        </span>
                      </>
                    ) : (
                      <span className="text-red-500 text-xs">
                        {' '}
                        (
                        {stats?.change_24
                          ? dollarFormat(stats?.change_24)
                          : stats?.change_24 ?? ''}
                        %)
                      </span>
                    )}
                  </div>
                ) : (
                  ''
                )}

                {networkId === 'testnet' && (
                  <div className="h-10 py-1 rounded-lg flex justify-start pl-5 items-center w-52">
                    <p className="text-xs text-gray-500 dark:text-neargray-10 font-medium leading-6 px-1 whitespace-nowrap">
                      Testnet Network
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="w-full lg:!w-2/4 flex justify-end items-center gap-3 h-10">
            {showSearch && (
              <div className="w-full md:w-[70%] flex items-center">
                <Search
                  header
                  pathname={pathname}
                  globalError={!!globalError}
                />
              </div>
            )}
            <ul className="hidden md:flex justify-end text-gray-500 pb-4 md:pb-0">
              <li>
                <>
                  <span className="group w-full relative h-full">
                    <a
                      className={`hidden md:flex  items-center justify-center w-full hover:text-green-500 dark:hover:text-green-250 hover:no-underline py-2 px-0`}
                      href="#"
                    >
                      <div className="py-2 px-3 h-9 w-[38px] bg-gray-100 dark:bg-black-200 rounded flex items-center">
                        <Image
                          alt="NearBlocks"
                          className="dark:filter dark:invert"
                          height="14"
                          loading="eager"
                          src="/images/near.svg"
                          width="14"
                        />
                      </div>
                    </a>
                    <ul className="bg-white dark:bg-black-600 font-medium text-sm soft-shadow hidden min-w-full absolute top-full right-0 rounded-b-lg !border-t-2 !border-t-green-500 group-hover:block py-2 z-[99]">
                      <li>
                        <a
                          className={`block w-full hover:text-green-500 dark:text-green-250 hover:no-underline py-2 px-4 text-gray-500 ${
                            networkId === 'mainnet'
                              ? 'text-green-500 dark:text-green-250'
                              : 'text-nearblue-600 dark:text-neargray-10'
                          }`}
                          href="https://nearblocks.io"
                        >
                          Mainnet
                        </a>
                      </li>
                      <li>
                        <a
                          className={`block w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 hover:no-underline ${
                            networkId === 'testnet'
                              ? 'text-green-500 dark:text-green-250'
                              : 'text-nearblue-600 dark:text-neargray-10'
                          }`}
                          href="https://testnet.nearblocks.io"
                        >
                          Testnet
                        </a>
                      </li>
                    </ul>
                  </span>
                </>
              </li>
            </ul>
            <span className="hidden md:!flex  relative h-full mr-2">
              <span
                className={` flex justify-start  items-center md:justify-center w-full hover:text-green-500 dark:hover:text-green-250 hover:no-underline py-2 `}
              >
                <div
                  className="py-2 px-3 h-9 w-[38px] bg-gray-100 dark:bg-black-200 rounded cursor-pointer flex items-center"
                  onClick={toggleTheme}
                  suppressHydrationWarning
                >
                  <Image
                    alt="NearBlocks"
                    height="14"
                    loading="eager"
                    src={`/images/${theme === 'dark' ? 'moon.svg' : 'sun.svg'}`}
                    width="14"
                  />
                </div>
              </span>
            </span>
          </div>
        </div>
      </div>

      <header className="dark:bg-black-600 bg-white shadow-sm">
        <div className="container-xxl w-full mx-auto">
          <div className="md:flex flex-wrap-reverse pt-1 md:pt-0">
            <div className="flex items-center justify-between w-full md:!w-auto px-3 ">
              <div className="mb-1 sm:!mb-0">
                <Link
                  className="flex justify-start items-center hover:no-underline"
                  href="/"
                >
                  <Image
                    alt="NearBlocks"
                    className="block"
                    height="41"
                    layout="fixed"
                    loading="eager"
                    src={
                      theme === 'dark'
                        ? '/images/nearblocksblack_dark.svg'
                        : '/images/nearblocksblack.svg'
                    }
                    width="174"
                  />
                </Link>
              </div>
              <div className="flex md:!hidden items-center justify-center ml-auto p-3 md:p-4 mb-1 sm:!mb-0">
                <button
                  className="py-2 h-6 w-[36px] bg-gray-100 dark:bg-black-200 rounded mx-4 flex items-center justify-center"
                  onClick={toggleTheme}
                >
                  <Image
                    alt="NearBlocks"
                    height="14"
                    loading="eager"
                    src={`/images/${theme === 'dark' ? 'moon.svg' : 'sun.svg'}`}
                    width="14"
                  />
                </button>
                <button
                  className="flex md:!hidden items-center justify-center"
                  onClick={() => setOpen((o) => !o)}
                >
                  <Menu className="dark:text-neargray-10" />
                </button>
              </div>
            </div>
            <div className="flex flex-col flex-grow w-full md:!w-auto">
              <nav
                className={`w-auto h-full md:flex md:w-auto text-sm py-0.5 order-1 md:order-2 flex-col md:!flex-row ${
                  open ? 'flex' : 'hidden'
                }`}
              >
                <ul className="w-full  md:flex justify-end text-gray-500 dark:text-neargray-100 py-0 md:py-0">
                  {menus.map((menu) => (
                    <li key={menu.id}>
                      {menu.submenu?.length ? (
                        <>
                          <Collapse
                            trigger={({ onClick, show }) => (
                              <div className="text-green-500 dark:text-green-250">
                                <div
                                  className="md:!hidden flex items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 text-sm font-medium dark:text-neargray-10 text-nearblue-600"
                                  onClick={(e: any) => onClick(e)}
                                >
                                  {t(menu.title) || menu.fallbackText}
                                  <ArrowDown
                                    className={`fill-current transition-transform w-5 h-5 ${
                                      show && 'transform rotate-180'
                                    }`}
                                  />
                                </div>
                              </div>
                            )}
                          >
                            <ul className="border-l-2 border-green-500 dark:border-green-250 md:!hidden ml-4">
                              {menu?.submenu?.map((submenu) => (
                                <li key={submenu?.id}>
                                  <ActiveLink
                                    activeClassName="text-green-500 dark:text-green-250"
                                    inActiveClassName="dark:text-neargray-10 text-nearblue-600"
                                    exact={true}
                                    href={submenu?.link}
                                  >
                                    <div
                                      className="block w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 font-medium text-xs"
                                      onClick={() => setOpen(false)}
                                    >
                                      {submenu?.title
                                        ? t(submenu?.title)
                                        : submenu.fallbackText}
                                    </div>
                                  </ActiveLink>
                                </li>
                              ))}
                            </ul>
                          </Collapse>
                          <span className="group hidden md:flex h-full w-full relative">
                            <div className="text-green-500 dark:!text-green-250 cursor-pointer">
                              <div className="hidden md:flex h-full items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 font-medium text-sm dark:text-neargray-10 text-nearblue-600">
                                {menu.fallbackText}
                                <ArrowDown className="fill-current w-4 h-4 ml-2 transition-transform duration-200 group-hover:rotate-180" />
                              </div>
                            </div>
                            <ul
                              className="bg-white dark:bg-black-600 shadow-lg absolute top-full min-w-full rounded-b-lg border-t-2 border-t-green-500 
                     transform opacity-0 -translate-y-2 invisible transition-all duration-200 ease-out
                     group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible py-2 z-20"
                            >
                              {menu.submenu.map((submenu) => (
                                <li key={submenu.id}>
                                  <ActiveLink
                                    activeClassName="text-green-500 dark:text-green-250 font-medium"
                                    inActiveClassName="dark:text-neargray-10 text-nearblue-600"
                                    exact={true}
                                    href={submenu?.link}
                                  >
                                    <div className="block w-full hover:text-green-500 dark:hover:text-green-250 whitespace-nowrap py-2 px-4">
                                      {submenu.fallbackText}
                                    </div>
                                  </ActiveLink>
                                </li>
                              ))}
                            </ul>
                          </span>
                        </>
                      ) : (
                        <ActiveLink
                          activeClassName="text-green-500 dark:text-green-250"
                          inActiveClassName="dark:text-neargray-10 text-nearblue-600"
                          exact={true}
                          href={menu.link || ''}
                        >
                          <div
                            onClick={() => setOpen(false)}
                            className="flex items-center w-full h-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 font-medium text-sm"
                          >
                            {t(menu.title) || menu.fallbackText}
                          </div>
                        </ActiveLink>
                      )}
                    </li>
                  ))}
                  <li>
                    <>
                      <Collapse
                        trigger={({ onClick, show }) => (
                          <div
                            className="md:!hidden flex items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 font-medium text-sm dark:text-neargray-10 text-nearblue-600"
                            onClick={onClick}
                          >
                            {t('header.menu.languages')}
                            <ArrowDown
                              className={`fill-current transition-transform w-5 h-5 ${
                                show && 'transform rotate-180'
                              }`}
                            />
                          </div>
                        )}
                      >
                        <ul className="border-l-2 border-green-500 dark:border-green-250 md:!hidden ml-4 ">
                          {languages.map((language) => (
                            <li key={language.locale}>
                              <IntlLink
                                className={`block w-full hover:text-green-500 dark:hover:text-green-250 whitespace-nowrap py-2 px-4 font-medium text-xs ${
                                  locale === language.locale
                                    ? 'text-green-500 dark:text-green-250'
                                    : 'dark:text-neargray-10 text-nearblue-600'
                                }`}
                                href={pathname}
                                locale={language.locale}
                              >
                                {language.title}
                              </IntlLink>
                            </li>
                          ))}
                        </ul>
                      </Collapse>
                      <span className="group hidden md:flex h-full w-full relative">
                        <div
                          className="hidden md:flex h-full items-center justify-between w-full py-2 px-4 font-medium text-sm dark:text-neargray-10 text-nearblue-600 
  hover:text-green-500 dark:hover:text-green-250 cursor-pointer"
                        >
                          {t('header.menu.languages') || 'Languages'}
                          <ArrowDown className="fill-current w-4 h-4 ml-2 transition-transform duration-200 group-hover:rotate-180" />
                        </div>
                        <ul
                          className="bg-white dark:bg-black-600 soft-shadow absolute top-full left-0 min-w-full rounded-b-lg !border-t-2 !border-t-green-500 
  transform opacity-0 -translate-y-2 invisible transition-all duration-200 ease-out
  group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible z-20 py-2"
                        >
                          {languages.map((language) => (
                            <li key={language.locale}>
                              <IntlLink
                                className={`block w-full hover:text-green-500 dark:hover:text-green-250 whitespace-nowrap py-2 px-4 font-normal ${
                                  locale === language.locale
                                    ? 'text-green-500 dark:text-green-250'
                                    : 'dark:text-neargray-10 text-nearblue-600'
                                }`}
                                href={pathname}
                                locale={language.locale}
                              >
                                {language.title}
                              </IntlLink>
                            </li>
                          ))}
                        </ul>
                      </span>
                    </>
                  </li>
                  <li>
                    <span className="hidden md:flex h-full items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-">
                      <Image
                        alt="NearBlocks"
                        height="41"
                        layout="fixed"
                        loading="eager"
                        src="/images/pipe.svg"
                        width="2"
                      />
                    </span>
                  </li>
                  <li>
                    <UserMenu AccountId={accountId} />
                  </li>
                </ul>
                <ul className="md:flex justify-end dark:text-neargray-10 text-nearblue-600 pb-2 md:pb-0">
                  <li>
                    <>
                      <Collapse
                        trigger={({ onClick, show }) => (
                          <div
                            className="md:!hidden flex items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 hover:no-underline"
                            onClick={onClick}
                          >
                            <Image
                              alt="NearBlocks"
                              className="dark:filter dark:invert"
                              height="14"
                              loading="eager"
                              src="/images/near.svg"
                              width="14"
                            />
                            <ArrowDown
                              className={`fill-current transition-transform w-5 h-5 ${
                                show && 'transform rotate-180'
                              }`}
                            />
                          </div>
                        )}
                      >
                        <ul className="border-l-2 border-green-500 dark:text-green-250 md:hidden ml-4">
                          <li>
                            <a
                              className={`block w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 hover:no-underline font-medium text-xs
                                ${
                                  networkId === 'mainnet'
                                    ? 'text-green-500 dark:text-green-250'
                                    : 'text-nearblue-600 dark:text-neargray-10'
                                }`}
                              href="https://nearblocks.io"
                            >
                              Mainnet
                            </a>
                          </li>
                          <li>
                            <a
                              className={`block w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 hover:no-underline font-medium text-xs
                                ${
                                  networkId === 'testnet'
                                    ? 'text-green-500 dark:text-green-250'
                                    : 'text-nearblue-600 dark:text-neargray-10'
                                }`}
                              href="https://testnet.nearblocks.io"
                            >
                              Testnet
                            </a>
                          </li>
                        </ul>
                      </Collapse>
                    </>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
export default Header;
