'use client';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

import useRpc from '@/hooks/app/useRpc';
import { Link } from '@/i18n/routing';
import {
  getTimeAgoString,
  localFormat,
  nanoToMilli,
  truncateString,
  weight,
  yoctoToNear,
} from '@/utils/app/libs';
import {
  AccountContractInfo,
  AccountDataInfo,
  ContractCodeInfo,
} from '@/utils/types';

import TokenImage from '../common/TokenImage';
import { useParams } from 'next/navigation';
import Skeleton from '../skeleton/common/Skeleton';
import { useRpcStore } from '@/stores/app/rpc';
const AccountMoreInfoActions = ({
  accountData: account,
  deploymentData,
  nftTokenData,
  tokenData,
  status,
  parse,
}: any) => {
  const { contractCode, viewAccessKeys, viewAccount } = useRpc();
  const [contract, setContract] = useState<ContractCodeInfo | null>(null);
  const [accountData, setAccountData] = useState<AccountContractInfo>(account);
  const [accountView, setAccountView] = useState<AccountDataInfo | null>(null);
  const [isAccountLoading, setIsAccountLoading] = useState(true);
  const [contractLoading, setContractLoading] = useState(true);
  const [isLocked, setIsLocked] = useState<boolean>();
  const [rpcError, setRpcError] = useState(false);
  const t = useTranslations();
  const { id } = useParams<{ id: string }>();
  const rpcUrl: string = useRpcStore((state) => state.rpc);
  const switchRpc: () => void = useRpcStore((state) => state.switchRpc);

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

  useEffect(() => {
    if (rpcError) {
      try {
        switchRpc();
      } catch (error) {
        setRpcError(true);
        console.error('Failed to switch RPC:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpcError]);

  const isContract =
    parse?.contract?.[0]?.contract &&
    Array.isArray(parse?.contract?.[0]?.contract?.methodNames) &&
    parse.contract[0].contract.methodNames.length > 0;

  useEffect(() => {
    const loadSchema = async () => {
      try {
        setRpcError(false);
        setContractLoading(true);
        let hasError = false;
        const [code, keys, account]: any = await Promise.all([
          contractCode(id as string).catch((error: any) => {
            console.error(`Error fetching contract code for ${id}:`, error);
            return null;
          }),
          viewAccessKeys(id).catch((error: any) => {
            console.log(`Error fetching access keys for ${id}:`, error);
            hasError = true;
            return null;
          }),
          viewAccount(id).catch((error: any) => {
            console.log(`Error fetching account for ${id}:`, error);
            hasError = true;
            return null;
          }),
        ]);

        if (hasError) setRpcError(true);

        if (account) {
          setAccountView(account);
        }

        if (code && code?.code_base64) {
          setContract({
            block_hash: code?.block_hash,
            block_height: code?.block_height,
            code_base64: code?.code_base64,
            hash: code?.hash,
          });
        } else {
          setContract(null);
        }

        const locked = (keys?.keys || []).every(
          (key: {
            access_key: {
              nonce: string;
              permission: string;
            };
            public_key: string;
          }) => key.access_key.permission !== 'FullAccess',
        );

        setIsLocked(locked);
      } catch (error) {
        console.error('Error loading schema:', error);
      } finally {
        setContractLoading(false);
        setIsAccountLoading(false);
      }
    };
    loadSchema();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, status, rpcUrl]);

  const accountInfo = status ? accountData : accountView;
  const stakedBalace = status ? accountData?.locked : accountView?.locked;
  const tokenTracker = tokenData?.name || nftTokenData?.name;
  const storageUsed = status
    ? accountData?.storage_usage
    : accountView?.storage_usage;
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
                {!status && isAccountLoading && <div className="h-5"></div>}
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
                {isAccountLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : storageUsed != null ? (
                  weight(storageUsed)
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>
          {(deploymentData?.receipt_predecessor_account_id ||
            (contract && contract?.hash)) && (
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
                  {(contract && contract?.hash) || isContract ? (
                    <div className="xl:flex xl:w-full justify-between w-max items-center gap-x-2">
                      <div className="whitespace-nowrap xl:mb-0 mb-1.5 flex">
                        Contract Locked:
                      </div>
                      <div className="break-words flex w-6 h-5">
                        {contractLoading ? (
                          <Skeleton className="h-4 w-16" />
                        ) : contract?.code_base64 && isLocked ? (
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
                  <div className="flex py-2">
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
                  ) : isAccountLoading ? (
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
                      {contractLoading ? (
                        <Skeleton className="h-4 w-16" />
                      ) : contract?.code_base64 && isLocked ? (
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
