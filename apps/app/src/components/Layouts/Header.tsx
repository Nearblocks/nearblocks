import Link from 'next/link';
import Image from 'next/legacy/image';
import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from 'next-themes';
import Collapse from '../Collapse';
import Menu from '../Icons/Menu';
import ArrowDown from '../Icons/ArrowDown';
import ActiveLink from '../ActiveLink';
import Skeleton from '@/components/skeleton/common/Skeleton';
import { networkId } from '@/utils/config';
import { dollarFormat, nanoToMilli } from '@/utils/libs';
import User from '../Icons/User';
import { BlocksInfo, Stats } from '@/utils/types';
import Search from '../common/Search';

const menus = [
  {
    id: 1,
    title: 'header.menu.home',
    link: '/',
    submenu: [],
  },
  {
    id: 2,
    title: 'header.menu.blockchain',
    submenu: [
      {
        id: 1,
        title: 'header.menu.viewBlocks',
        link: '/blocks',
      },
      {
        id: 2,
        title: 'header.menu.viewTxns',
        link: '/txns',
      },
      {
        id: 4,
        title: 'header.menu.charts',
        link: '/charts',
      },
      {
        id: 5,
        title: 'header.menu.nodeExplorer',
        link: '/node-explorer',
      },
    ],
  },
  {
    id: 3,
    title: 'header.menu.tokens',
    submenu: [
      {
        id: 1,
        title: 'header.menu.toptoken',
        link: '/tokens',
      },
      {
        id: 2,
        title: 'header.menu.viewTokenTrasfers',
        link: '/tokentxns',
      },
      {
        id: 3,
        title: 'header.menu.topnft',
        link: '/nft-tokens',
      },
      {
        id: 4,
        title: 'header.menu.viewNftTrasfers',
        link: '/nft-tokentxns',
      },
    ],
  },
];

const languages = [
  {
    title: 'English',
    locale: 'en',
  },
  {
    title: '한국어',
    locale: 'kr',
  },
  {
    title: 'Bahasa',
    locale: 'id',
  },
  {
    title: '汉语 (Simplified)',
    locale: 'zh-cn',
  },
  {
    title: '漢語 (Traditional)',
    locale: 'zh-hk',
  },
  {
    title: 'Українська',
    locale: 'ua',
  },
  {
    title: 'Русский',
    locale: 'ru',
  },
  {
    title: 'Tiếng Việt',
    locale: 'vi',
  },
  {
    title: 'Español',
    locale: 'es',
  },
  {
    title: 'Français',
    locale: 'fr',
  },
  {
    title: '日本語',
    locale: 'jp',
  },
  {
    title: 'Filipino',
    locale: 'ph',
  },
  {
    title: 'ภาษาไทย',
    locale: 'th',
  },
  {
    title: 'Italiano',
    locale: 'it',
  },
];

interface Props {
  statsDetails?: { stats: Stats[] };
  latestBlocks?: { blocks: BlocksInfo[] };
}

const Header = ({ statsDetails, latestBlocks }: Props) => {
  /* eslint-disable @next/next/no-img-element */

  const router = useRouter();
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const requestSignInWithWallet = useAuthStore(
    (store) => store.requestSignInWithWallet,
  );
  const signedIn = useAuthStore((store) => store.signedIn);
  const accountId = useAuthStore((store) => store.accountId);
  const logOut = useAuthStore((store) => store.logOut);
  const user = signedIn;

  const stats: Stats | undefined = statsDetails?.stats?.[0];
  const block: BlocksInfo | undefined = latestBlocks?.blocks?.[0];

  const status = useMemo(() => {
    if (block?.block_timestamp) {
      const timestamp = nanoToMilli(block?.block_timestamp);

      const utcDate = Date.parse(new Date(timestamp).toISOString());
      const currentTime = Date.now();

      if ((currentTime - utcDate) / (1000 * 60) > 10) {
        return false;
      }
    }
    return true;
  }, [block]);

  const showSearch = router.pathname !== '/';
  const userLoading = false;

  const onSignOut = () => {
    logOut();
  };
  const nearPrice = stats?.near_price ?? '';
  return (
    <div className="dark:bg-black-600 soft-shadow">
      {!status && (
        <div className="flex flex-wrap">
          <span className="items-center justify-center text-center w-full border-b-2 border-nearblue bg-nearblue dark:border-black-200 dark:bg-black-200 py-2 text-green dark:text-green-250 text-sm whitespace-normal sm:whitespace-nowrap">
            {`${t('outofSync')}`}
          </span>
        </div>
      )}
      <div className="container mx-auto">
        <div className="flex flex-wrap">
          <div className="flex items-center justify-between w-full md:!w-auto px-3 ">
            <div className={showSearch ? 'pt-3' : ''}>
              <Link href="/" className="" legacyBehavior>
                <a className="flex justify-start items-center hover:no-underline">
                  <Image
                    src={
                      theme === 'dark'
                        ? '/images/nearblocksblack_dark.svg'
                        : '/images/nearblocksblack.svg'
                    }
                    className="block"
                    width="174"
                    height="40"
                    alt="NearBlocks"
                    layout="fixed"
                  />
                </a>
              </Link>
              {showSearch &&
                (!stats ? (
                  <div className="py-3">
                    <Skeleton className="h-4 mt-[5px]" />
                  </div>
                ) : (
                  <div style={{ marginTop: '5px' }} className="mb-2">
                    {networkId === 'testnet' ? (
                      <p className="text-xs py-1 text-gray-500 leading-6 px-2">
                        Testnet Network
                      </p>
                    ) : (
                      <>
                        {nearPrice ? (
                          <div className="ml-12 px-1 py-1 bg-blue-900/[0.05] rounded-lg flex justify-center items-center">
                            <Image
                              src={
                                theme === 'dark'
                                  ? '/images/neargrey_dark.svg'
                                  : '/images/neargrey.svg'
                              }
                              alt="NearBlock"
                              className="inline-flex w-5 h-5"
                              width={15}
                              height={15}
                            />
                            <p className="text-sm text-gray-500 dark:text-neargray-10 font-medium leading-6 px-1">
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
                      </>
                    )}
                  </div>
                ))}
            </div>
            <div className="flex md:!hidden items-center justify-center ml-auto p-3 md:p-4">
              <button
                className="py-2 h-6 w-[36px] bg-gray-100 dark:bg-black-200 rounded mx-4 flex items-center justify-center"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                <Image
                  src={`/images/${theme === 'dark' ? 'moon.svg' : 'sun.svg'}`}
                  width="14"
                  height="14"
                  alt="NearBlocks"
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
            {showSearch && (
              <div className="relative h-full w-full md:!w-3/4 lg:!w-3/5 md:!ml-auto px-3 md:!pt-2 md:!pb-0 order-2 md:!order-1">
                <div className="h-11">
                  <Search header />
                </div>
              </div>
            )}
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
                          trigger={({ show, onClick }) => (
                            <a
                              className="md:!hidden flex items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4"
                              href="#"
                              onClick={onClick}
                            >
                              {t(menu.title)}
                              <ArrowDown
                                className={`fill-current transition-transform w-5 h-5 ${
                                  show && 'transform rotate-180'
                                }`}
                              />
                            </a>
                          )}
                        >
                          <ul className="border-l-2 border-green-500 dark:border-green-250 md:!hidden ml-4">
                            {menu.submenu.map((submenu) => (
                              <li key={submenu.id}>
                                <ActiveLink href={submenu.link}>
                                  <a
                                    className="block w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4"
                                    onClick={() => setOpen(false)}
                                  >
                                    {t(submenu.title)}
                                  </a>
                                </ActiveLink>
                              </li>
                            ))}
                          </ul>
                        </Collapse>
                        <span className="group hidden md:flex h-full w-full relative">
                          <a
                            className={`hidden md:flex h-full items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4`}
                            href="#"
                          >
                            {t(menu.title)}
                            <ArrowDown className="fill-current w-4 h-4 ml-2" />
                          </a>
                          <ul className="bg-white dark:bg-black-600 soft-shadow hidden min-w-full absolute top-full rounded-b-lg !border-t-2 !border-t-green-500 group-hover:block py-2 z-[99]">
                            {menu.submenu.map((submenu) => (
                              <li key={submenu.id}>
                                <ActiveLink
                                  href={submenu.link}
                                  activeClassName="text-green-500 dark:text-green-250"
                                >
                                  <a className="block w-full hover:text-green-500 dark:hover:text-green-250 whitespace-nowrap py-2 px-4">
                                    {t(submenu.title)}
                                  </a>
                                </ActiveLink>
                              </li>
                            ))}
                          </ul>
                        </span>
                      </>
                    ) : (
                      <ActiveLink
                        href={menu.link || ''}
                        activeClassName="text-green-500 dark:text-green-250"
                      >
                        <a className="flex items-center w-full h-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4">
                          {t(menu.title)}
                        </a>
                      </ActiveLink>
                    )}
                  </li>
                ))}
                <li>
                  <>
                    <Collapse
                      trigger={({ show, onClick }) => (
                        <a
                          className="md:!hidden flex items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4"
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
                            <ActiveLink href="#" locale={language.locale}>
                              <a className="block w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4">
                                {language.title}
                              </a>
                            </ActiveLink>
                          </li>
                        ))}
                      </ul>
                    </Collapse>
                    <span className="group hidden md:flex h-full w-full relative">
                      <a
                        className={`hidden md:flex h-full items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4`}
                        href="#"
                      >
                        {t('header.menu.languages')}
                        <ArrowDown className="fill-current w-4 h-4 ml-2" />
                      </a>
                      <ul className="bg-white  dark:bg-black-600 soft-shadow hidden  absolute top-full rounded-b-lg !border-t-2 !border-t-green-500 group-hover:block py-2 z-[99]">
                        {languages.map((language) => (
                          <li key={language.locale}>
                            <ActiveLink href="#" locale={language.locale}>
                              <a className="block w-full hover:text-green-500 dark:hover:text-green-250 whitespace-nowrap py-2 px-4">
                                {language.title}
                              </a>
                            </ActiveLink>
                          </li>
                        ))}
                      </ul>
                    </span>
                  </>
                </li>
                <li>
                  <>
                    <Collapse
                      trigger={({ show, onClick }) => (
                        <a
                          className="flex md:!hidden items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4"
                          href="#"
                          onClick={onClick}
                        >
                          <div className="w-full">
                            {user ? (
                              <div className="flex justify-between">
                                <div className="flex items-center">
                                  <span className="truncate max-w-[110px]">
                                    {accountId}
                                  </span>
                                </div>
                                <ArrowDown
                                  className={`fill-current transition-transform w-5 h-5 ${
                                    show && 'transform rotate-180'
                                  }`}
                                />
                              </div>
                            ) : (
                              <div onClick={requestSignInWithWallet}>
                                <div className="w-full flex items-center">
                                  <User className="mx-1 mr-2 text-sm bg-gray-500 rounded-full p-0.5 text-white" />
                                  Sign In
                                </div>
                              </div>
                            )}
                          </div>
                        </a>
                      )}
                    >
                      {user && (
                        <ul className="border-l-2 border-green-500 md:hidden ml-2">
                          <li className="px-4 pb-1">
                            <button
                              onClick={onSignOut}
                              className="bg-green-200/70 w-full rounded-md text-white text-xs text-center py-1 whitespace-nowrap dark:bg-green-250 dark:text-neargray-10"
                            >
                              Sign Out
                            </button>
                          </li>
                        </ul>
                      )}
                    </Collapse>

                    <span className="group hidden md:flex h-full w-full relative">
                      <a
                        className={`hidden md:flex h-full items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 `}
                        href="#"
                      >
                        {user ? (
                          <>
                            <User className="mx-1 text-sm bg-gray-500 rounded-full p-0.5 text-white" />
                            <span className="truncate max-w-[110px]">
                              {accountId}
                            </span>
                            <ArrowDown className="fill-current w-4 h-4 ml-2" />
                          </>
                        ) : (
                          <div onClick={requestSignInWithWallet}>
                            <div className="flex items-center">
                              {userLoading ? (
                                <>
                                  <User className="mx-1 mr-2 text-sm bg-gray-500 rounded-full p-0.5 text-white" />
                                  <Skeleton className="flex w-14 h-4" />
                                </>
                              ) : (
                                <>
                                  <User className="mx-1 mr-2 text-sm bg-gray-500 rounded-full p-0.5 text-white" />
                                  Sign In
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </a>

                      {user && (
                        <ul className="bg-white dark:bg-black-600 soft-shadow hidden  absolute top-full rounded-b-lg !border-t-2 !border-t-green-500 group-hover:!block py-2 px-4 z-[99]">
                          <li className="px-8 pb-1">
                            <button
                              onClick={onSignOut}
                              className="bg-green-200/70 dark:bg-green-250 dark:text-neargray-10 rounded-md text-white text-xs text-center py-1 px-4 whitespace-nowrap"
                            >
                              Sign Out
                            </button>
                          </li>
                        </ul>
                      )}
                    </span>
                  </>
                </li>
              </ul>
              <ul className="md:flex justify-end text-gray-500 pb-4 md:pb-0">
                <li>
                  <span className="hidden md:flex h-full items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4">
                    <Image
                      src="/images/pipe.svg"
                      width="2"
                      height="31"
                      layout="fixed"
                      alt="NearBlocks"
                    />
                  </span>
                </li>
                <li>
                  <>
                    <Collapse
                      trigger={({ show, onClick }) => (
                        <a
                          className="md:!hidden flex items-center justify-between w-full hover:text-green-500 dark:hover:text-green-250 py-2 px-4 hover:no-underline"
                          href="#"
                          onClick={onClick}
                        >
                          <Image
                            src="/images/near.svg"
                            width="14"
                            height="14"
                            alt="NearBlocks"
                            className="fixed dark:filter dark:invert"
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
                            className="block w-full hover:text-green-500 dark:hover:text-green-250 dark:text-neargray-10  py-2 px-4 hover:no-underline"
                            href="https://nearblocks.io"
                          >
                            Mainnet
                          </a>
                        </li>
                        <li>
                          <a
                            className="block w-full hover:text-green-500 dark:hover:text-green-250 dark:text-neargray-10  py-2 px-4 hover:no-underline"
                            href="https://testnet.nearblocks.io"
                          >
                            Testnet
                          </a>
                        </li>
                      </ul>
                    </Collapse>
                    <span className="group hidden md:flex w-full relative h-full">
                      <a
                        className={`hidden md:flex  items-center justify-center w-full hover:text-green-500 dark:hover:text-green-250 hover:no-underline py-2 px-0 mr-3`}
                        href="#"
                      >
                        <div className="py-2 px-3 h-9 w-[38px] bg-gray-100 dark:bg-black-200 rounded">
                          <img
                            src="/images/near.svg"
                            width="14"
                            height="14"
                            alt="NearBlocks"
                            className="dark:filter dark:invert"
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
              <ul className="hidden md:flex justify-end text-gray-500 pb-4 md:pb-0">
                <li>
                  <>
                    <span className="group  flex w-full relative h-full">
                      <span
                        className={` flex justify-start  items-center md:justify-center w-full hover:text-green-500 dark:hover:text-green-250 hover:no-underline py-2 px-1 mr-3`}
                      >
                        <div
                          className="py-2 px-3 h-9 w-[38px] bg-gray-100 dark:bg-black-200 rounded cursor-pointer"
                          onClick={() =>
                            setTheme(theme === 'light' ? 'dark' : 'light')
                          }
                        >
                          <Image
                            src={`/images/${
                              theme === 'dark' ? 'moon.svg' : 'sun.svg'
                            }`}
                            width="14"
                            height="14"
                            alt="NearBlocks"
                          />
                        </div>
                      </span>
                    </span>
                  </>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
