'use client';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { useConfig } from '@/hooks/app/useConfig';
import useScreenSize from '@/hooks/app/useScreenSize';
import { Link, routing, usePathname } from '@/i18n/routing';
import { setCurrentTheme } from '@/utils/app/actions';
import { nanoToMilli } from '@/utils/app/libs';
import { dollarFormat } from '@/utils/libs';
import { Stats } from '@/utils/types';

import ActiveLink from '../ActiveLink';
import Collapse from '../Collapse';
import Search from '../common/Search';
import ArrowDown from '../Icons/ArrowDown';
import Menu from '../Icons/Menu';
import UserMenu from './UserMenu';

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
        link: '/multi-chain-txns',
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
  handleFilterAndKeyword,
  role,
  stats: statsDetails,
  sync,
  theme: cookieTheme,
  token,
  user,
}: any) => {
  const stats: Stats | undefined = statsDetails?.stats?.[0];
  const [open, setOpen] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState(true);

  const profile = [
    {
      id: 1,
      link: '/user/overview',
      title: 'My Profile',
    },
    {
      id: 2,
      link: '/user/settings',
      title: 'Settings',
    },
    {
      id: 3,
      link: role === 'publisher' ? '/publisher/keys' : '/user/keys',
      title: 'API Keys',
    },
  ];

  const nearPrice = stats?.near_price ?? '';
  const t = useTranslations();
  const { networkId } = useConfig();
  const pathname = usePathname();
  const isMobile = useScreenSize();
  const router = useRouter();
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

  const showSearch = pathname !== '/';

  const onSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('stripe-plan-id');
    localStorage.removeItem('interval');
    localStorage.removeItem('subscribe-called');
    Cookies.remove('token');
    Cookies.remove('role');
    Cookies.remove('user');
    router.push('/login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    setTheme(newTheme);
  };

  const IntlLink = (props: any) => {
    if (!routing?.locales?.includes(props.locale)) {
      console.error(`Invalid locale: ${props.locale}`);
      return null;
    }

    return <Link {...props} />;
  };

  useEffect(() => {
    router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        className="w-full sticky top-0 dark:bg-black-600 bg-white z-[9999] justify-center border-b-[1px] dark:border-gray-800"
      >
        {!syncStatus && (
        <div className="flex flex-wrap md:flex w-full top-0">
          <div className="flex items-center justify-center text-center w-full border-b-2 border-nearblue bg-nearblue dark:border-black-200 dark:bg-black-200 py-2 text-green dark:text-green-250 text-sm">
            {t('outofSync') ||
              'This blockchain explorer is out of sync. Some blocks or transactions may be delayed.'}
          </div>
        </div>
      )}
        <div className={`${!showSearch ? 'hidden md:block' : 'px-2'} md:!flex container-xxl p-0.5 w-full mx-auto flex justify-between`}>
          <div className="hidden md:!flex md:!w-[35%] h-10">
            <div className="dark:!bg-black-600 h-full md:!pt-2 w-32 flex items-center">
              <div className="h-11 flex items-center">
                {networkId === 'mainnet' && nearPrice ? (
                  <div className="h-10 py-1 rounded-lg flex justify-center items-center pl-2">
                    <p className={`text-xs text-gray-500 dark:text-neargray-10 font-medium leading-6 whitespace-nowrap ${!showSearch ? 'px-3' : 'px-1.5'}`}>
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
                  handleFilterAndKeyword={handleFilterAndKeyword}
                  header
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
                    <ul className="bg-white dark:bg-black-600 soft-shadow hidden min-w-full absolute top-full right-0 rounded-b-lg !border-t-2 !border-t-green-500 group-hover:block py-2 z-[99]">
                      <li>
                        <a
                          className={`block w-full hover:text-green-500 dark:text-green-250 hover:no-underline py-2 px-4 text-gray-500 ${
                            networkId === 'mainnet'
                              ? 'text-green-500 dark:text-green-250'
                              : 'text-gray-500 dark:text-neargray-10'
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
                              : 'text-gray-500 dark:text-neargray-10'
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
                className={` flex justify-start  items-center md:justify-center w-full hover:text-green-500 dark:hover:text-green-250 hover:no-underline py-2 ${!showSearch ? 'pr-2.5' : 'pr-1'}`}
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
        <div className="container-xxl w-full mx-auto md:pt-0 pt-1">
          <div className="flex flex-wrap">
            <div className="flex items-center justify-between w-full md:!w-auto px-3">
              <div>
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
              <div className="flex md:!hidden items-center justify-center ml-auto py-3 md:p-4">
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
            <div className="flex flex-col flex-grow w-full md:!w-auto mb-2 md:mb-0">
              <nav
                className={`w-auto h-full md:flex md:w-auto text-sm py-0.5 order-1 md:order-2 flex-col md:!flex-row ${
                  open ? 'flex ' : 'hidden'
                }`}
              >
                <ul className="w-full  md:flex justify-end text-gray-500 dark:text-neargray-100 py-0 md:py-0">
                  {menus.map((menu) => (
                    <li key={menu.id}>
                      {menu.submenu?.length ? (
                        <>
                          <Collapse
                            trigger={({ onClick, show }) => (
                              <a
                                className="md:!hidden flex items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 text-sm font-medium dark:text-neargray-10 text-black-600"
                                href="#"
                                onClick={onClick}
                              >
                                {t(menu.title) || menu.fallbackText}
                                <ArrowDown
                                  className={`fill-current transition-transform w-5 h-5 ${
                                    show && 'transform rotate-180'
                                  }`}
                                />
                              </a>
                            )}
                          >
                            <ul className="border-l-2 border-green-500 dark:border-green-250 md:!hidden ml-4">
                              {menu?.submenu?.map((submenu) => (
                                <li key={submenu?.id}>
                                  <Link
                                    className="block w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 font-medium text-xs dark:text-neargray-10 text-black-600"
                                    href={submenu?.link}
                                    onClick={() => setOpen(false)}
                                  >
                                    {submenu?.title
                                      ? t(submenu?.title)
                                      : submenu.fallbackText}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </Collapse>
                          <span className="group hidden md:flex h-full w-full relative">
                            <a
                              className={`hidden md:flex h-full items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 font-medium text-sm dark:text-neargray-10 text-black-600`}
                              href="#"
                            >
                              {t(menu?.title) || menu.fallbackText}
                              <ArrowDown className="fill-current w-4 h-4 ml-2" />
                            </a>
                            <ul className="bg-white dark:bg-black-600 soft-shadow hidden min-w-full absolute top-full rounded-b-lg !border-t-2 !border-t-green-500 group-hover:block py-2 z-20">
                              {menu?.submenu?.map((submenu) => (
                                <li key={submenu?.id}>
                                  <ActiveLink
                                    activeClassName="text-green-500 dark:text-green-250"
                                    href={submenu?.link}
                                  >
                                    <div className="block w-full hover:text-green-500 dark:hover:text-green-250 whitespace-nowrap py-2 px-4 dark:text-neargray-10 text-black-600">
                                      {submenu?.title
                                        ? t(submenu?.title)
                                        : submenu.fallbackText}
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
                          href={menu.link || ''}
                        >
                          <div className="flex items-center w-full h-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 font-medium text-sm dark:text-neargray-10 text-black-600">
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
                          <a
                            className="md:!hidden flex items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 font-medium text-sm dark:text-neargray-10 text-black-600"
                            href="#"
                            onClick={onClick}
                          >
                            {t('header.menu.languages')}
                            <ArrowDown
                              className={`fill-current transition-transform w-5 h-5 ${
                                show && 'transform rotate-180'
                              }`}
                            />
                          </a>
                        )}
                      >
                        <ul className="border-l-2 border-green-500 dark:border-green-250 md:!hidden ml-4">
                          {languages.map((language) => (
                            <li key={language.locale}>
                              <IntlLink
                                className="block w-full hover:text-green-500 dark:hover:text-green-250 whitespace-nowrap py-2 px-4 font-medium text-xs dark:text-neargray-10 text-black-600"
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
                        <a
                          className={`hidden md:flex h-full items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 font-medium text-sm dark:text-neargray-10 text-black-600`}
                          href="#"
                        >
                          {t('header.menu.languages') || 'Languages'}
                          <ArrowDown className="fill-current w-4 h-4 ml-2" />
                        </a>
                        <ul className="bg-white  dark:bg-black-600 soft-shadow hidden  absolute top-full rounded-b-lg !border-t-2 !border-t-green-500 group-hover:block py-2 z-20">
                          {languages.map((language) => (
                            <li key={language.locale}>
                              <IntlLink
                                className="block w-full hover:text-green-500 dark:hover:text-green-250 whitespace-nowrap py-2 px-4 font-normal dark:text-neargray-10 text-black-600"
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
                    <span className="hidden md:flex h-full items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4">
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
                  <li className='pr-1'>
                    <UserMenu
                      onSignOut={onSignOut}
                      profile={profile}
                      token={token}
                      user={user}
                    />
                  </li>
                </ul>
                <ul className="md:flex justify-end dark:text-neargray-10 text-black-600 pb-4 md:pb-0">
                  <li>
                    <>
                      <Collapse
                        trigger={({ onClick, show }) => (
                          <a
                            className="md:!hidden flex items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 hover:no-underline"
                            href="#"
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
                          </a>
                        )}
                      >
                        <ul className="border-l-2 border-green-500 dark:text-green-250 md:hidden ml-4">
                          <li>
                            <a
                              className="block w-full hover:text-green-500 dark:hover:text-green-250 dark:text-neargray-10  py-2 px-4 hover:no-underline font-medium text-xs text-black-600"
                              href="https://nearblocks.io"
                            >
                              Mainnet
                            </a>
                          </li>
                          <li>
                            <a
                              className="block w-full hover:text-green-500 dark:hover:text-green-250 dark:text-neargray-10  py-2 px-4 hover:no-underline font-medium text-xs text-black-600"
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
