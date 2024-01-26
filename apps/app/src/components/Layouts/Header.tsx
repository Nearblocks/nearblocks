import Link from 'next/link';
import Image from 'next/legacy/image';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';

import Collapse from '../Collapse';
import Menu from '../Icons/Menu';
import ArrowDown from '../Icons/ArrowDown';
import ActiveLink from '../ActiveLink';
import Skeleton from '@/components/skeleton/common/Skeleton';
import { useBosComponents } from '@/hooks/useBosComponents';
import { VmComponent } from '../vm/VmComponent';
import { networkId } from '@/utils/config';
import { convertToUTC, dollarFormat, nanoToMilli } from '@/utils/libs';
import User from '../Icons/User';
import { BlocksInfo, Stats } from '@/utils/types';

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
        title: 'Node Explorer',
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
        title: 'Top Tokens',
        link: '/tokens',
      },
      {
        id: 2,
        title: 'Token Transfers',
        link: '/tokentxns',
      },
      {
        id: 3,
        title: 'Top NFT Tokens',
        link: '/nft-tokens',
      },
      {
        id: 4,
        title: 'NFT Token Transfers',
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

const Header = () => {
  const components = useBosComponents();
  const router = useRouter();
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({} as Stats);
  const [block, setBlock] = useState<BlocksInfo>({} as BlocksInfo);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let delay = 5000;
    async function fetchStats() {
      try {
        const response = await fetch(
          networkId === 'mainnet'
            ? 'https://api2.nearblocks.io/v1/stats'
            : 'https://api2-testnet.nearblocks.io/v1/stats',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        const dataArray = await response.json();
        const data: Stats = dataArray?.stats?.[0];
        if (response.status === 200) {
          setStats(data);
        }
      } catch (error) {
        setError(true);
        console.log(error);
      } finally {
        if (isLoading) setIsLoading(false);
      }
    }

    async function fetchBlocks() {
      try {
        const response = await fetch(
          networkId === 'mainnet'
            ? 'https://api2.nearblocks.io/v1/blocks/latests?limit=1'
            : 'https://api2-testnet.nearblocks.io/v1/blocks/latests?limit=1',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        const data: BlocksInfo = await response.json();

        if (response.status === 200) {
          setBlock(data);
        }
      } catch (error) {
        console.log(error);
      }
    }

    fetchStats();
    fetchBlocks();

    const interval = setInterval(fetchStats, delay);

    return () => clearInterval(interval);
  }, [router, isLoading]);

  const status = useMemo(() => {
    if (block?.block_timestamp) {
      const timestamp = +convertToUTC(
        nanoToMilli(block?.block_timestamp),
        true,
      );
      const currentTime = new Date().getTime();

      if ((currentTime - timestamp) / (1000 * 60) > 10) {
        return false;
      }
    }
    return true;
  }, [block]);

  const showSearch = router.pathname !== '/';
  const userLoading = false;

  return (
    <div className="bg-white soft-shadow z-20 relative">
      {!status && (
        <div className="flex flex-wrap">
          <div className="flex items-center justify-center text-center w-full  border-b-2 border-nearblue bg-nearblue py-2 text-green text-sm ">
            {t('outofSync')}
          </div>
        </div>
      )}
      <div className="container mx-auto">
        <div className="flex flex-wrap">
          <div className="flex items-center justify-between w-full md:!w-auto px-3 ">
            <div className={showSearch ? 'pt-3' : ''}>
              <Link href="/" className="" legacyBehavior>
                <a className="flex justify-start items-center hover:no-underline">
                  <Image
                    src="/images/nearblocksblack.svg"
                    className="block"
                    width="174"
                    height="40"
                    alt="NearBlocks"
                    layout="fixed"
                  />
                </a>
              </Link>
              {showSearch &&
                (error || isLoading ? (
                  <Skeleton className="h-4 mt-[5px]" />
                ) : (
                  <div style={{ marginTop: '5px' }} className="mb-2">
                    {networkId === 'testnet' ? (
                      <p className="text-xs  text-gray-500 leading-6 px-2">
                        Testnet Network
                      </p>
                    ) : (
                      <div className="ml-12 px-1 py-1 bg-blue-900/[0.05] rounded-lg flex justify-center items-center">
                        <Image
                          src="/images/neargrey.svg"
                          alt="NearBlock"
                          className="inline-flex w-5 h-5"
                          width={15}
                          height={15}
                        />
                        <p className="text-sm text-gray-500 font-medium leading-6 px-2">
                          ${dollarFormat(stats?.near_price || 0)}{' '}
                          {stats?.change_24 > 0 ? (
                            <span className="text-neargreen text-xs">
                              (+{dollarFormat(stats?.change_24)}%)
                            </span>
                          ) : (
                            <span className="text-red-500 text-xs">
                              ({dollarFormat(stats?.change_24)}%)
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
            <button
              className="flex md:!hidden items-center justify-center ml-auto p-3 md:p-4"
              onClick={() => setOpen((o) => !o)}
            >
              <Menu />
            </button>
          </div>
          <div className="flex flex-col flex-grow w-full md:!w-auto">
            {showSearch && (
              <div className="relative h-full w-full md:!w-3/4 lg:!w-3/5 md:!ml-auto px-3 md:!pt-2 md:!pb-0 order-2 md:!order-1">
                <div className="h-11">
                  <VmComponent
                    src={components?.search}
                    skeleton={
                      <>
                        <div className="absolute top-0 left-0 w-full md:mt-2 mt-0 pb-4 h-11 pr-0 md:pr-8 px-3 md:px-0">
                          <Skeleton className="h-11" />
                        </div>
                      </>
                    }
                    props={{
                      isHeader: true,
                      t: t,
                      network: networkId,
                    }}
                  />
                </div>
              </div>
            )}
            <nav
              className={`w-auto h-full md:flex md:w-auto text-sm py-0.5 order-1 md:order-2 flex-col md:!flex-row ${
                open ? 'flex ' : 'hidden'
              }`}
            >
              <ul className="w-full  md:flex justify-end text-gray-500 py-0 md:py-0 bg-red-900s">
                {menus.map((menu) => (
                  <li key={menu.id}>
                    {menu.submenu?.length ? (
                      <>
                        <Collapse
                          trigger={({ show, onClick }) => (
                            <a
                              className="md:!hidden flex items-center justify-between w-full hover:text-green-500 py-2 px-4 hover:no-underline"
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
                          <ul className="border-l-2 border-green-500 md:hidden ml-4">
                            {menu.submenu.map((submenu) => (
                              <li key={submenu.id}>
                                <ActiveLink href={submenu.link}>
                                  <a
                                    className="block w-full hover:text-green-500 py-2 px-4 hover:no-underline"
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
                            className={`hidden md:flex h-full items-center justify-between w-full hover:text-green-500 py-2 px-4 hover:no-underline`}
                            href="#"
                          >
                            {t(menu.title)}
                            <ArrowDown className="fill-current w-4 h-4 ml-2" />
                          </a>
                          <ul className="bg-white soft-shadow hidden min-w-full absolute top-full rounded-b-lg border-t-2 border-green-500 group-hover:block py-2">
                            {menu.submenu.map((submenu) => (
                              <li key={submenu.id}>
                                <ActiveLink
                                  href={submenu.link}
                                  activeClassName="text-green-500"
                                >
                                  <a className="block w-full hover:text-green-500 whitespace-nowrap py-2 px-4 hover:no-underline">
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
                        activeClassName="text-green-500"
                      >
                        <a className="flex items-center w-full h-full hover:text-green-500 py-2 px-4 hover:no-underline">
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
                          className="md:!hidden flex items-center justify-between w-full hover:text-green-500 py-2 px-4 hover:no-underline"
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
                      <ul className="border-l-2 border-green-500 md:hidden ml-4">
                        {languages.map((language) => (
                          <li key={language.locale}>
                            <ActiveLink href="/" locale={language.locale}>
                              <a className="block w-full hover:text-green-500 py-2 px-4">
                                {language.title}
                              </a>
                            </ActiveLink>
                          </li>
                        ))}
                      </ul>
                    </Collapse>
                    <span className="group hidden md:flex h-full w-full relative">
                      <a
                        className={`hidden md:flex h-full items-center justify-between w-full hover:text-green-500 py-2 px-4 hover:no-underline`}
                        href="#"
                      >
                        {t('header.menu.languages')}
                        <ArrowDown className="fill-current w-4 h-4 ml-2" />
                      </a>
                      <ul className="bg-white soft-shadow hidden  absolute top-full rounded-b-lg border-t-2 border-green-500 group-hover:block py-2">
                        {languages.map((language) => (
                          <li key={language.locale}>
                            <ActiveLink href="/" locale={language.locale}>
                              <a className="block w-full hover:text-green-500 whitespace-nowrap py-2 px-4 hover:no-underline">
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
                    <span className="group hidden md:flex h-full w-full relative">
                      <a
                        className={`hidden md:flex h-full items-center justify-between w-full hover:no-underline hover:text-green-500 py-2 px-4`}
                        href="#"
                      >
                        <ActiveLink href="/login">
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
                        </ActiveLink>
                      </a>
                    </span>
                  </>
                </li>
              </ul>

              <ul className="md:flex justify-end text-gray-500 pb-4 md:pb-0">
                <li>
                  <span className="hidden md:flex h-full items-center justify-between w-full hover:text-green-500 py-2 px-4">
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
                          className="md:!hidden flex items-center justify-between w-full hover:text-green-500 py-2 px-4 hover:no-underline"
                          href="#"
                          onClick={onClick}
                        >
                          <Image
                            src="/images/near.svg"
                            width="14"
                            height="14"
                            alt="NearBlocks"
                            className="fixed"
                          />
                          <ArrowDown
                            className={`fill-current transition-transform w-5 h-5 ${
                              show && 'transform rotate-180'
                            }`}
                          />
                        </a>
                      )}
                    >
                      <ul className="border-l-2 border-green-500 md:hidden ml-4">
                        <li>
                          <a
                            className="block w-full hover:text-green-500  py-2 px-4 hover:no-underline"
                            href="https://nearblocks.io"
                          >
                            Mainnet
                          </a>
                        </li>
                        <li>
                          <a
                            className="block w-full hover:text-green-500  py-2 px-4 hover:no-underline"
                            href="https://testnet.nearblocks.io/"
                          >
                            Testnet
                          </a>
                        </li>
                      </ul>
                    </Collapse>

                    <span className="group hidden md:flex w-full relative h-full">
                      <a
                        className={`hidden md:flex  items-center justify-center w-full hover:text-green-500 hover:no-underline py-2 px-0 mr-3`}
                        href="#"
                      >
                        <div className="py-2 px-3 h-9 w-[38px] bg-gray-100 rounded">
                          <Image
                            src="/images/near.svg"
                            width="14"
                            height="14"
                            alt="NearBlocks"
                          />
                        </div>
                      </a>
                      <ul className="bg-white soft-shadow hidden min-w-full absolute top-full right-0 rounded-b-lg border-t-2 border-green-500 group-hover:block py-2">
                        <li>
                          <a
                            className={`block w-full hover:text-green-500 hover:no-underline py-2 px-4 text-gray-500 ${
                              networkId === 'mainnet'
                                ? 'text-green-500'
                                : 'text-gray-500'
                            }`}
                            href="https://beta.nearblocks.io"
                          >
                            Mainnet
                          </a>
                        </li>
                        <li>
                          <a
                            className={`block w-full hover:text-green-500 py-2 px-4 hover:no-underline ${
                              networkId === 'testnet'
                                ? 'text-green-500'
                                : 'text-gray-500'
                            }`}
                            href="https://beta-testnet.nearblocks.io/"
                          >
                            Testnet
                          </a>
                        </li>
                      </ul>
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
