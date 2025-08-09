'use client';

import { getTimeAgoString } from '@/utils/libs';

import TokenImage from '@/components/app/common/TokenImage';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
import { CopyButton } from '@/components/app/common/CopyButton';
import { shortenAddress } from '@/utils/app/libs';
import { Link } from '@/i18n/routing';

interface MTTokenBase {
  name: string;
  id: string;
  symbol: string;
  icon: string;
  decimals: number;
}

interface MTTokenData {
  title: string;
  description: string;
  media: string;
  issued_at: number;
  starts_at: number;
  updated_at: number;
  extra: string;
}

interface MTToken {
  base: MTTokenBase;
  token: MTTokenData;
}

interface Props {
  mtToken: MTToken;
  contract: string;
  token: string;
  isUnknown: boolean;
}

const MTOverviewActions = ({ mtToken, contract, token, isUnknown }: Props) => {
  const formatTimestamp = (timestamp: number) => {
    return getTimeAgoString(timestamp * 1000);
  };

  return (
    <>
      <div className="flex items-center justify-between flex-wrap">
        {!mtToken && !isUnknown ? (
          <div className="w-80 max-w-xs px-2 py-5">
            <Skeleton className="h-7" />
          </div>
        ) : (
          <div className="sm:flex flex-1 items-center w-full py-5 px-2">
            <h1 className="break-all font-medium dark:text-neargray-10 text-nearblue-600 text-lg pr-2">
              <span className="inline-flex align-middle h-7 w-7 -ml-1">
                <TokenImage
                  alt={mtToken?.base?.name}
                  className="w-7 h-7"
                  src={mtToken?.base?.icon}
                />
              </span>
              <span className="inline-flex align-middle mx-2">MT Token:</span>
              <span className="break-all align-middle font-semibold">
                {isUnknown ? 'Unknown' : mtToken?.base?.name}
              </span>
            </h1>
          </div>
        )}
      </div>

      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2 md:mb-2">
          <div className="w-full">
            <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
              <h2 className="border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
                Overview
              </h2>

              <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">Symbol:</div>
                  {!mtToken ? (
                    <div className="w-32">
                      <Skeleton className="h-4" />
                    </div>
                  ) : (
                    <div className="w-full md:w-3/4 break-words font-medium">
                      {mtToken?.base?.symbol}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Description:
                  </div>
                  {!mtToken ? (
                    <div className="w-32">
                      <Skeleton className="h-4" />
                    </div>
                  ) : (
                    <div className="w-full md:w-3/4 break-words">
                      {mtToken?.token?.description ||
                        'No description available'}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Issued At:
                  </div>
                  {!mtToken ? (
                    <div className="w-32">
                      <Skeleton className="h-4" />
                    </div>
                  ) : (
                    <div className="w-full md:w-3/4 break-words">
                      {formatTimestamp(mtToken?.token?.issued_at)}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Last Updated:
                  </div>
                  {!mtToken ? (
                    <div className="w-32">
                      <Skeleton className="h-4" />
                    </div>
                  ) : (
                    <div className="w-full md:w-3/4 break-words">
                      {formatTimestamp(mtToken?.token?.updated_at)}
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
              <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
                <div className="flex xl:flex-nowrap md:!flex-nowrap sm:flex-nowrap flex-wrap items-center justify-between sm:divide-x sm:dark:divide-black-200 pt-4 pb-4 gap-y-2">
                  <div className="flex md:items-center xl:gap-x-24 lg:gap-x-12 md:gap-x-28 mr-3 lg:flex-wrap xl:flex-nowrap md:!flex-nowrap sm:flex-wrap flex-wrap justify-between">
                    <div className="w-full mb-1 md:mb-0">Token ID:</div>
                    <div className=" items-center text-center flex lg:ml-[3px]">
                      {!token ? (
                        <div className="w-full break-words">
                          <div className="w-32">
                            <Skeleton className="h-4" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full whitespace-nowrap flex">
                          {shortenAddress(token)}
                          <span className="mx-0.5">
                            <CopyButton textToCopy={token} />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex xl:flex-nowrap md:!flex-nowrap sm:flex-nowrap flex-wrap items-center justify-between sm:divide-x sm:dark:divide-black-200 pt-4 pb-4 gap-y-2">
                  <div className="flex md:items-center xl:gap-x-24 lg:gap-x-12 md:gap-x-28 mr-3 lg:flex-wrap xl:flex-nowrap md:!flex-nowrap sm:flex-wrap flex-wrap justify-between">
                    <div className="w-full mb-1 md:mb-0">Contract:</div>
                    <div className=" items-center text-center flex lg:ml-[3px]">
                      {!contract ? (
                        <div className="w-full break-words">
                          <div className="w-32">
                            <Skeleton className="h-4" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full whitespace-nowrap flex">
                          <Link
                            className="text-green-500 dark:text-green-250 font-medium"
                            href={`/address/${contract}`}
                          >
                            {shortenAddress(contract)}
                          </Link>
                          <span className="mx-0.5">
                            <CopyButton textToCopy={contract} />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between py-4 w-full">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">Decimals:</div>
                  <div className="w-full md:w-3/4 break-words">
                    {!mtToken ? (
                      <div className="w-32">
                        <Skeleton className="h-4" />
                      </div>
                    ) : (
                      mtToken?.base?.decimals
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

export default MTOverviewActions;
