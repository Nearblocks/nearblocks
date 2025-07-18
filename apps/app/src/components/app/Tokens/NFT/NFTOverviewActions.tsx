'use client';
import { useState } from 'react';

import { useFetch } from '@/hooks/app/useFetch';
import { Link } from '@/i18n/routing';
import { getTimeAgoString, localFormat, nanoToMilli } from '@/utils/libs';
import { SpamToken, Token } from '@/utils/types';

import Links from '@/components/app/common/Links';
import TokenImage from '@/components/app/common/TokenImage';
import Tooltip from '@/components/app/common/Tooltip';
import WarningIcon from '@/components/app/Icons/WarningIcon';
import Skeleton from '@/components/app/skeleton/common/Skeleton';

interface Props {
  holders: string;
  id: string;
  status: {
    height: 0;
    sync: true;
    timestamp: '';
  };
  theme: string;
  token: Token;
  transfers: string;
}

const NFTOverviewActions = ({
  holders,
  id,
  status,
  theme,
  token,
  transfers,
}: Props) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  const { data: spamList } = useFetch(
    'https://raw.githubusercontent.com/Nearblocks/spam-token-list/main/tokens.json',
  );
  const spamTokens: SpamToken = spamList;

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

  return (
    <>
      <div className="flex items-center justify-between flex-wrap">
        {!token ? (
          <div className="w-80 max-w-xs py-4 px-1">
            <Skeleton className="h-7" />
          </div>
        ) : (
          <h1 className="break-all space-x-2 text-lg font-medium dark:text-neargray-10 text-nearblue-600 leading-8 py-5 px-2">
            <span className="inline-flex align-middle h-7 w-7">
              <TokenImage
                alt={token?.name}
                className="w-7 h-7"
                src={token?.icon}
              />
            </span>
            <span className="inline-flex align-middle ">Token: </span>
            <span className="break-all align-middle font-semibold">
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
                className="underline mx-0.5"
                href="https://github.com/Nearblocks/spam-token-list"
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
                  {!token ? (
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
                  {!transfers ? (
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
                  {!holders ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <div className="w-full md:w-3/4 break-words">
                      <div className="flex items-center">
                        {holders ? localFormat(holders) : ''}
                        {!status?.sync && status && (
                          <Tooltip
                            className={'left-28 max-w-[200px] w-40'}
                            position="top"
                            tooltip={
                              <>
                                Holders count is out of sync. Last synced block
                                is
                                <span className="font-bold mx-0.5">
                                  {localFormat &&
                                    localFormat(String(status?.height))}
                                </span>
                                {status?.timestamp &&
                                  `(${getTimeAgoString(
                                    nanoToMilli(status?.timestamp),
                                  )}).`}
                                Holders data will be delayed.
                              </>
                            }
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
                  {!token ? (
                    <div className="w-full md:w-3/4 break-words">
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : (
                    <div className="w-full text-green-500 dark:text-green-250 md:w-3/4 break-words">
                      <Link
                        className="text-green-500 dark:text-green-250 hover:no-underline font-medium"
                        href={`/address/${token?.contract}`}
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
                    {!token ? (
                      <Skeleton className="h-4 w-32" />
                    ) : (
                      <Link
                        className="hover:no-underline"
                        href={`${token?.website}`}
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
                    {!token ? (
                      <Skeleton className="h-4 w-32" />
                    ) : (
                      <Links meta={token} theme={theme} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NFTOverviewActions;
