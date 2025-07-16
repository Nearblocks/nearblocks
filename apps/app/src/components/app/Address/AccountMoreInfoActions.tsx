'use client';
import { useTranslations } from 'next-intl';
import React, { use, useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import {
  getTimeAgoString,
  localFormat,
  nanoToMilli,
  truncateString,
  weight,
  yoctoToNear,
} from '@/utils/app/libs';
import { AccountContractInfo } from '@/utils/types';

import TokenImage from '@/components/app/common/TokenImage';
import { useParams } from 'next/navigation';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
import { useAddressRpc } from '../common/AddressRpcProvider';
const AccountMoreInfoActions = ({
  accountDataPromise,
  deploymentDataPromise,
  nftTokenDataPromise,
  tokenDataPromise,
  syncDataPromise,
}: {
  accountDataPromise: Promise<any>;
  deploymentDataPromise: Promise<any>;
  nftTokenDataPromise: Promise<any>;
  tokenDataPromise: Promise<any>;
  syncDataPromise: Promise<any>;
}) => {
  const account = use(accountDataPromise);
  const deployment = use(deploymentDataPromise);
  const nftToken = use(nftTokenDataPromise);
  const ftToken = use(tokenDataPromise);
  const syncData = use(syncDataPromise);

  const deploymentData = deployment?.deployments?.[0];
  const status = syncData && syncData?.status?.indexers?.balance?.sync;
  const tokenData = ftToken?.contracts?.[0];
  const nftTokenData = nftToken?.contracts?.[0];
  const [accountData, setAccountData] = useState<AccountContractInfo>(
    account?.account?.[0],
  );

  const {
    account: accountView,
    contractInfo,
    isLocked,
    isLoading,
  } = useAddressRpc();
  const t = useTranslations();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (
      (status &&
        accountData &&
        accountView &&
        !accountData?.storage_usage &&
        accountView?.storage_usage) ||
      (!accountData?.code_hash && accountView?.code_hash)
    ) {
      setAccountData((prevData) => ({
        ...prevData,
        storage_usage: accountView?.storage_usage,
        code_hash: accountView?.code_hash,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountView, status]);

  const isContract = !!contractInfo;
  const accountInfo = status ? accountData : accountView;
  const stakedBalace = status ? accountData?.locked : accountView?.locked;
  const tokenTracker = tokenData?.name || nftTokenData?.name;
  const storageUsed = status
    ? accountData?.storage_usage
    : accountView?.storage_usage;

  interface TokenTrackerRowProps {
    label: string;
    data: {
      name: string;
      symbol: string;
      icon?: string;
      price?: string;
    };
    href: string;
    className?: string;
  }

  const TokenTrackerRow: React.FC<TokenTrackerRowProps> = ({
    label,
    data,
    href,
    className,
  }) => (
    <div
      className={`xl:flex items-center ${className ? className : 'gap-x-8'}`}
    >
      <div className="whitespace-nowrap xl:mb-0 mb-1.5">{label}</div>
      <div className="flex">
        <span className="flex flex-wrap break-words">
          <span className="flex items-center">
            <TokenImage
              alt={data.name}
              className="w-4 h-4 mr-1"
              src={data.icon}
            />
            <Link
              className="flex text-green-500 dark:text-green-250 hover:no-underline"
              href={href}
            >
              <span className="inline-block truncate max-w-[80px] mr-1">
                {data.name}
              </span>
              (
              <span className="inline-block truncate max-w-[80px]">
                {data.symbol}
              </span>
              )
            </Link>
          </span>
          {data?.price && (
            <span className="flex text-nearblue-600 dark:text-neargray-10">
              (@ ${localFormat(data.price)})
            </span>
          )}
        </span>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
        <h2 className="leading-6 border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
          {t('moreInfo') || 'Account information'}
        </h2>
        <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
          <div className="flex flex-wrap xl:flex-nowrap xl:w-[94.2%] lg:w-[95.3%] w-[93.5%] py-4 justify-between items-center">
            <div className="xl:flex xl:w-1/2 w-max items-center gap-x-5">
              <div className="whitespace-nowrap xl:mb-0 mb-1.5">
                Staked {t('balance') || 'Balance'}:
              </div>
              <div>
                {!status && isLoading && <div className="h-5"></div>}
                {stakedBalace
                  ? yoctoToNear(stakedBalace, true) + ' Ⓝ'
                  : stakedBalace ?? ''}
              </div>
            </div>
            <div className="xl:flex xl:w-1/2 w-max items-center gap-x-7">
              <div className="whitespace-nowrap xl:mb-0 mb-1.5">
                {t('storageUsed') || 'Storage used'}:
              </div>
              <div className="w-20 h-5">
                {isLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : storageUsed != null ? (
                  weight(storageUsed)
                ) : (
                  '0'
                )}
              </div>
            </div>
          </div>
          {(deploymentData?.receipt_predecessor_account_id ||
            (contractInfo && contractInfo?.hash)) && (
            <div
              className={`flex justify-between w-full py-4  ${
                deploymentData?.receipt_predecessor_account_id
                  ? 'visible'
                  : 'hidden'
              }`}
            >
              <div className="flex justify-between xl:w-[85.5%] lg:w-[100%] w-[100%] ">
                {deploymentData?.receipt_predecessor_account_id && (
                  <div className="xl:flex w-max items-center gap-x-2.5">
                    <div className="whitespace-nowrap xl:mb-0 mb-1.5">
                      Contract Creator:
                    </div>
                    <div className="flex flex-wrap xl:flex-nowrap">
                      <span className="flex mr-1">
                        <Link
                          className="text-green-500 truncate max-w-[100px] dark:text-green-250 hover:no-underline"
                          href={`/address/${deploymentData.receipt_predecessor_account_id}`}
                        >
                          {deploymentData.receipt_predecessor_account_id ?? ''}
                        </Link>
                      </span>
                      <span className="mr-1 whitespace-nowrap">at txn</span>
                      <Link
                        className="truncate max-w-[120px] text-green-500 dark:text-green-250 hover:no-underline"
                        href={`/txns/${deploymentData.transaction_hash}`}
                      >
                        {deploymentData.transaction_hash ?? ''}
                      </Link>
                    </div>
                  </div>
                )}
                <div>
                  {(contractInfo && contractInfo?.hash) || isContract ? (
                    <div className="xl:flex xl:w-full justify-between w-max items-center gap-x-2">
                      <div className="whitespace-nowrap xl:mb-0 mb-1.5 flex">
                        Contract Locked:
                      </div>
                      <div className="break-words flex w-6 h-5">
                        {isLocked == null ? (
                          <Skeleton className="h-4 w-16" />
                        ) : contractInfo?.code_base64 && isLocked ? (
                          'Yes'
                        ) : (
                          'No'
                        )}
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-between w-full py-2">
            <div
              className={`flex flex-wrap justify-between ${
                tokenTracker
                  ? tokenData?.name
                    ? deploymentData?.receipt_predecessor_account_id
                      ? 'xl:w-[93.7%] lg:w-[92%] md:w-[89%] w-[90.1%]'
                      : 'xl:w-[87.8%] w-[100%]'
                    : deploymentData?.receipt_predecessor_account_id
                    ? 'xl:w-[95.8%] lg:w-[94%] md:w-[92%] w-[93%]'
                    : 'xl:w-[87.8%] w-[100%]'
                  : 'xl:w-[87.8%] w-[100%]'
              }`}
            >
              {tokenTracker &&
                isContract &&
                deploymentData?.receipt_predecessor_account_id && (
                  <div className="flex py-2 flex-col gap-2">
                    {tokenData?.name && nftTokenData?.name ? (
                      <div className="flex-1">
                        <TokenTrackerRow
                          label="Token Tracker:"
                          data={tokenData}
                          href={`/token/${id}`}
                        />
                        <TokenTrackerRow
                          label="NFT Token Tracker:"
                          data={nftTokenData}
                          href={`/nft-token/${id}`}
                          className="mt-2 ml-0.5 gap-x-1"
                        />
                      </div>
                    ) : tokenData?.name ? (
                      <TokenTrackerRow
                        label="Token Tracker:"
                        data={tokenData}
                        href={`/token/${id}`}
                      />
                    ) : nftTokenData?.name ? (
                      <TokenTrackerRow
                        label="NFT Token Tracker:"
                        data={nftTokenData}
                        href={`/nft-token/${id}`}
                        className="gap-x-2"
                      />
                    ) : null}
                  </div>
                )}
              <div>
                <div className="xl:flex w-full break-words gap-x-11 py-2">
                  <div className="flex  whitespace-nowrap xl:mb-0 mb-1.5">
                    {accountView !== null &&
                    accountView?.block_hash === undefined &&
                    accountData?.deleted?.transaction_hash
                      ? 'Deleted At'
                      : 'Created At'}
                    :
                  </div>
                  {accountView !== null &&
                  accountView?.block_hash === undefined &&
                  accountData?.deleted?.transaction_hash ? (
                    <div className="flex whitespace-nowrap">
                      <span className="mr-1">
                        {getTimeAgoString(
                          nanoToMilli(accountData.deleted.block_timestamp),
                        )}
                      </span>
                      {!deploymentData?.receipt_predecessor_account_id && (
                        <span>
                          {` at txn`}
                          <Link
                            className="text-green-500 dark:text-green-250 hover:no-underline px-1"
                            href={`/txns/${accountData?.deleted?.transaction_hash}`}
                          >
                            {truncateString(
                              accountData?.deleted?.transaction_hash,
                              15,
                              '...',
                            )}
                          </Link>
                        </span>
                      )}
                    </div>
                  ) : accountData?.created?.transaction_hash ? (
                    <div className="flex whitespace-nowrap">
                      <span className="xl:ml-1">
                        {getTimeAgoString(
                          nanoToMilli(accountData.created.block_timestamp),
                        )}
                      </span>
                      {!deploymentData?.receipt_predecessor_account_id && (
                        <span className="ml-1">
                          {` at txn`}
                          <Link
                            className="text-green-500 dark:text-green-250 hover:no-underline px-1"
                            href={`/txns/${accountData?.created?.transaction_hash}`}
                          >
                            {truncateString(
                              accountData?.created?.transaction_hash,
                              15,
                              '...',
                            )}
                          </Link>
                        </span>
                      )}
                    </div>
                  ) : accountInfo?.code_hash ? (
                    <span className="xl:ml-1.5">Genesis</span>
                  ) : isLoading ? (
                    <div className="h-5"></div>
                  ) : (
                    'N/A'
                  )}
                </div>
              </div>
              {isContract &&
                !deploymentData?.receipt_predecessor_account_id && (
                  <div className="xl:flex xl:w-full justify-between w-max items-center gap-x-5 py-2">
                    <div className="whitespace-nowrap xl:mb-0 mb-1.5 flex">
                      Contract Locked:
                    </div>
                    <div className="break-words flex w-6 h-5">
                      {isLocked == null ? (
                        <Skeleton className="h-4 w-16" />
                      ) : contractInfo?.code_base64 && isLocked ? (
                        'Yes'
                      ) : (
                        'No'
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
          {tokenTracker &&
            isContract &&
            !deploymentData?.receipt_predecessor_account_id && (
              <div className="flex justify-between w-full py-4">
                <div className="flex">
                  {tokenData?.name && (
                    <div className="xl:flex items-center gap-x-8">
                      <div className="whitespace-nowrap xl:mb-0 mb-1.5">
                        Token Tracker:
                      </div>
                      <div className="flex">
                        <span className="flex flex-wrap break-words">
                          <span className="flex items-center">
                            <TokenImage
                              alt={tokenData?.name}
                              className="w-4 h-4 mr-1"
                              src={tokenData?.icon}
                            />
                            <Link
                              className="flex text-green-500 dark:text-green-250 hover:no-underline"
                              href={`/token/${id}`}
                            >
                              <span className="inline-block truncate max-w-[80px] mr-1">
                                {tokenData.name}
                              </span>
                              (
                              <span className="inline-block truncate max-w-[80px]">
                                {tokenData.symbol}
                              </span>
                              )
                            </Link>
                          </span>
                          {tokenData.price && (
                            <span className="flex text-nearblue-600 dark:text-neargray-10">
                              (@ ${localFormat(tokenData.price)})
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                  {nftTokenData?.name && (
                    <div className="xl:flex items-center gap-x-2">
                      <div className="whitespace-nowrap xl:mb-0 mb-1.5">
                        NFT Token Tracker:
                      </div>
                      <div className="flex">
                        <span className="flex flex-wrap break-words w-full">
                          <span className="flex items-center">
                            <TokenImage
                              alt={nftTokenData?.name}
                              className="w-4 h-4 mr-1"
                              src={nftTokenData?.icon}
                            />
                            <Link
                              className="flex text-green-500 dark:text-green-250 hover:no-underline"
                              href={`/nft-token/${id}`}
                            >
                              <span className="inline-block truncate max-w-[80px] mr-1">
                                {nftTokenData?.name}
                              </span>
                              (
                              <span className="inline-block truncate max-w-[80px]">
                                {nftTokenData?.symbol}
                              </span>
                              )
                            </Link>
                          </span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AccountMoreInfoActions;
