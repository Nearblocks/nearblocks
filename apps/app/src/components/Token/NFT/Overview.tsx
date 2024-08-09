import Links from '@/components/common/Links';
import WarningIcon from '@/components/Icons/WarningIcon';
import Skeleton from '@/components/skeleton/common/Skeleton';
import { useFetch } from '@/hooks/useFetch';
import useHash from '@/hooks/useHash';
import { getTimeAgoString, localFormat, nanoToMilli } from '@/utils/libs';
import { SpamToken } from '@/utils/types';
import { Tooltip } from '@reach/tooltip';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import classNames from 'classnames';
import Transfers from './Transfers';
import Holders from './Holders';
import Inventory from './Inventory';
import TokenImage from '@/components/common/TokenImage';

const tabs = [' ', 'holders', 'inventory', 'comments'];

const Overview = () => {
  const router = useRouter();
  const { id } = router.query;
  const [hash, setHash] = useHash();
  const [tabIndex, setTabIndex] = useState(0);
  const { data, loading } = useFetch(`nfts/${id}`);
  const { data: syncData } = useFetch(`sync/status`);
  const { data: transfersData, loading: txnLoading } = useFetch(
    `nfts/${id}/txns/count`,
  );
  const { data: holdersData, loading: holderLoading } = useFetch(
    `nfts/${id}/holders/count`,
  );
  const token = data?.contracts?.[0];
  const status = syncData?.status?.aggregates.nft_holders;
  const transfers = transfersData?.txns?.[0]?.count;
  const holders = holdersData?.holders?.[0]?.count;
  const [isVisible, setIsVisible] = useState(true);
  console.log('holdersData', status);
  const handleClose = () => {
    setIsVisible(false);
  };
  const { data: spamList } = useFetch(
    'https://raw.githubusercontent.com/Nearblocks/spam-token-list/main/tokens.json',
  );
  const spamTokens: SpamToken = spamList?.blacklist;

  function isTokenSpam(tokenName: string) {
    if (spamTokens)
      for (const spamToken of spamTokens.blacklist) {
        const cleanedToken = spamToken.replace(/^\*/, '');
        if (tokenName.endsWith(cleanedToken)) {
          return true;
        }
      }
    return false;
  }

  useEffect(() => {
    const index = tabs.indexOf(hash as string);
    if (index !== tabIndex) {
      setTabIndex(index === -1 ? 0 : index);
    }
  }, [hash, tabIndex]);

  const onTab = (index: number) => setHash(tabs[index]);

  const getClassName = (selected: boolean) =>
    classNames(
      'text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none rounded-lg',
      {
        'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
          !selected,
        'bg-green-600 dark:bg-green-250 text-white': selected,
      },
    );

  return (
    <>
      <div className="flex items-center justify-between flex-wrap pt-4">
        {loading ? (
          <div className="w-80 max-w-xs px-3 py-5">
            <Skeleton className="h-7" />
          </div>
        ) : (
          <h1 className="break-all space-x-2 text-xl text-nearblue-600 dark:text-neargray-10 leading-8 py-4 px-2">
            <span className="inline-flex align-middle h-7 w-7">
              <TokenImage
                src={token?.icon}
                alt={token?.name}
                className="w-7 h-7"
              />
            </span>
            <span className="inline-flex align-middle ">Token: </span>
            <span className="inline-flex align-middle font-semibold">
              {token?.name}
            </span>
          </h1>
        )}
      </div>
      {isTokenSpam(token?.contract || id) && isVisible && (
        <>
          <div className="w-full flex justify-between text-left border dark:bg-nearred-500  dark:border-nearred-400 dark:text-nearred-300 bg-red-50 border-red-100 text-red-500 text-sm rounded-lg p-4">
            <p className="items-center">
              <WarningIcon className="w-5 h-5 fill-current mx-1 inline-flex" />
              This token is reported to have been spammed to many users. Please
              exercise caution when interacting with it. Click
              <a
                href="https://github.com/Nearblocks/spam-token-list"
                className="underline mx-0.5"
                target="_blank"
              >
                here
              </a>
              for more info.
            </p>
            <span
              className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-400 cursor-pointer"
              onClick={handleClose}
            >
              X
            </span>
          </div>
          <div className="py-2"></div>
        </>
      )}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="w-full">
            <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl">
              <h2 className="border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
                Overview
              </h2>

              <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Total Supply:
                  </div>
                  {loading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <div className="w-full md:w-3/4 break-words">
                      {token?.tokens
                        ? localFormat(token?.tokens as string)
                        : ''}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Transfers:
                  </div>
                  {txnLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <div className="w-full md:w-3/4 break-words">
                      {transfers && token
                        ? localFormat(transfers as string)
                        : ''}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">Holders:</div>
                  {holderLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <div className="w-full md:w-3/4 break-words">
                      <div className="flex items-center">
                        {holders ? localFormat(holders) : ''}
                        {!status?.sync && status && (
                          <Tooltip
                            label={
                              <>
                                Holders count is out of sync. Last synced block
                                is
                                <span className="font-bold mx-0.5">
                                  {localFormat && localFormat(status?.height)}
                                </span>
                                {status?.timestamp &&
                                  `(${getTimeAgoString(
                                    nanoToMilli(status?.timestamp),
                                  )}).`}
                                Holders data will be delayed.
                              </>
                            }
                            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                          >
                            <span>
                              <WarningIcon className="w-4 h-4 fill-current ml-1" />
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
              <h2 className="border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
                Profile Summary
              </h2>
              <div className="px-3 divide-y  dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">Contract:</div>
                  {loading ? (
                    <div className="w-full md:w-3/4 break-words">
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : (
                    <div className="w-full text-green-500 dark:text-green-250 md:w-3/4 break-words">
                      <Link
                        href={`/address/${token?.contract}`}
                        className="text-green-500 dark:text-green-250 hover:no-underline"
                      >
                        {token?.contract}
                      </Link>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Official Site:
                  </div>
                  <div className="w-full md:w-3/4 text-green-500 dark:text-green-250 break-words">
                    {loading ? (
                      <Skeleton className="h-4 w-32" />
                    ) : (
                      <Link
                        href={`${token?.website}`}
                        className="hover:no-underline"
                      >
                        {token?.website}
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Social Profiles:
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    {/* corrections needed */}
                    {loading ? (
                      <Skeleton className="h-4 w-32" />
                    ) : (
                      <Links meta={token} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="py-6"></div>
        <div className="block lg:flex lg:space-x-2 mb-4">
          <div className="w-full">
            <div>
              <Tabs onSelect={(index) => onTab(index)} selectedIndex={tabIndex}>
                <TabList className={'flex flex-wrap'}>
                  <Tab
                    className={getClassName(tabs[0] === tabs[tabIndex])}
                    selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                  >
                    <h2>Transfers</h2>
                  </Tab>
                  <Tab
                    className={getClassName(tabs[1] === tabs[tabIndex])}
                    selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                  >
                    <h2>Holders</h2>
                  </Tab>
                  <Tab
                    className={getClassName(tabs[2] === tabs[tabIndex])}
                    selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                  >
                    <h2>Inventory</h2>
                  </Tab>
                  <Tab
                    className={getClassName(tabs[3] === tabs[tabIndex])}
                    selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                  >
                    <h2>Comments</h2>
                  </Tab>
                </TabList>
                <TabPanel>
                  <Transfers id={id as string} />
                </TabPanel>
                <TabPanel>
                  <Holders id={id as string} tokens={token} />
                </TabPanel>
                <TabPanel>
                  <Inventory id={id as string} token={token} />
                </TabPanel>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Overview;
