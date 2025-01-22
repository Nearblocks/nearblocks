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
import { AccountDataInfo, ContractCodeInfo } from '@/utils/types';

import TokenImage from '../common/TokenImage';

export default function AccountMoreInfo({
  accountData,
  deploymentData,
  id,
  nftTokenData,
  tokenData,
  status,
}: any) {
  const { contractCode, viewAccessKeys, viewAccount } = useRpc();
  const [contract, setContract] = useState<ContractCodeInfo | null>(null);
  const [accountView, setAccountView] = useState<AccountDataInfo | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    const loadSchema = async () => {
      try {
        const [code, keys]: any = await Promise.all([
          contractCode(id).catch((error: any) => {
            console.log(`Error fetching contract code for ${id}:`, error);
            return null;
          }),
          viewAccessKeys(id).catch((error: any) => {
            console.log(`Error fetching access keys for ${id}:`, error);
            return null;
          }),
        ]);

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
      }
    };
    loadSchema();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const getAccountDetails = async () => {
      const [account]: any = await Promise.all([
        viewAccount(id).catch(() => {
          return null;
        }),
      ]);

      if (account) {
        setAccountView(account);
      } else {
        setAccountView(null);
      }
    };
    getAccountDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const accountInfo = status ? accountData : accountView;
  const stakedBalace = status ? accountData?.locked : accountView?.locked;

  let genesis =
    accountView !== null &&
    accountView?.block_hash === undefined &&
    accountData?.deleted?.transaction_hash
      ? false
      : accountData?.created?.transaction_hash
      ? false
      : accountData?.code_hash
      ? true
      : false;

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
          <div className="flex flex-wrap justify-between w-full py-3">
            <div>
              <div className="flex-1 xl:flex-nowrap flex-wrap items-center pb-2">
                <div className="mb-2 md:mb-0">
                  Staked {t('balance') || 'Balance'}:
                </div>
                <div className="flex whitespace-nowrap">
                  {stakedBalace
                    ? yoctoToNear(stakedBalace, true) + ' Ⓝ'
                    : stakedBalace ?? ''}
                </div>
              </div>
            </div>
            <div className="pr-[1.4rem]">
              <div className="flex-1 xl:flex-nowrap flex-wrap items-center">
                <div className="mb-2 md:mb-0 whitespace-nowrap">
                  {t('storageUsed') || 'Storage used'}:
                </div>
                <div className="flex whitespace-nowrap">
                  {storageUsed ? weight(storageUsed) : storageUsed ?? ''}
                </div>
              </div>
            </div>
          </div>
          {(deploymentData?.receipt_predecessor_account_id ||
            (contract && contract?.hash)) && (
            <div className="flex justify-between w-full flex-wrap py-3">
              <div>
                {deploymentData?.receipt_predecessor_account_id && (
                  <div className="flex-1 pb-2">
                    <div className="mb-2 md:mb-0 whitespace-nowrap">
                      Contract Creator:
                    </div>
                    <div className="flex lg:w-80 w-full pr-3 lg:whitespace-nowrap flex-wrap">
                      <span className="flex mr-1">
                        <Link
                          className="text-green-500 truncate max-w-[120px] dark:text-green-250 hover:no-underline"
                          href={`/address/${deploymentData.receipt_predecessor_account_id}`}
                        >
                          {deploymentData.receipt_predecessor_account_id ?? ''}
                        </Link>
                      </span>
                      <span className="flex">
                        <span className="mr-1 whitespace-nowrap">at txn</span>
                        <Link
                          className="truncate max-w-[120px] text-green-500 dark:text-green-250 hover:no-underline"
                          href={`/txns/${deploymentData.transaction_hash}`}
                        >
                          {deploymentData.transaction_hash ?? ''}
                        </Link>
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {!genesis && (
                <div>
                  {contract && contract?.hash ? (
                    <div className="flex-1 md:w-full">
                      <div className="mb-2 whitespace-nowrap md:mb-0">
                        Contract Locked:
                      </div>
                      <div className="w-full break-words">
                        {contract?.code_base64 && isLocked ? 'Yes' : 'No'}
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="flex flex-wrap md:flex-nowrap justify-between w-full py-4">
            {tokenTracker && (
              <div className="flex pb-2 pr-5">
                {tokenData?.name && (
                  <div className="flex-1 flex-nowrap">
                    <div className="flex md:w-1/4 mb-1 whitespace-nowrap">
                      Token Tracker:
                    </div>
                    <div className="flex">
                      <span className="sm:flex flex-1 flex-nowrap lg:whitespace-nowrap w-full">
                        <span className="flex">
                          <TokenImage
                            alt={tokenData?.name}
                            className="w-4 h-4 mr-2"
                            src={tokenData?.icon}
                          />
                          <Link
                            className="flex text-green-500 dark:text-green-250 hover:no-underline"
                            href={`/token/${id}`}
                          >
                            <span className="inline-block truncate max-w-[110px] mr-1">
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
                          <span className="flex whitespace-nowrap text-nearblue-600 dark:text-neargray-10 lg:ml-0 sm:ml-5">
                            (@ ${localFormat(tokenData.price)})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )}
                {nftTokenData?.name && (
                  <div className="flex-1 flex-nowrap">
                    <div className="flex md:w-1/4 mb-1 whitespace-nowrap">
                      NFT Token Tracker:
                    </div>
                    <div className="flex">
                      <span className="sm:flex flex-1 flex-nowrap lg:whitespace-nowrap w-full">
                        <span className="flex">
                          <TokenImage
                            alt={nftTokenData?.name}
                            className="w-4 h-4 mr-2"
                            src={nftTokenData?.icon}
                          />
                          <Link
                            className="flex text-green-500 dark:text-green-250 hover:no-underline"
                            href={`/nft-token/${id}`}
                          >
                            <span className="inline-block truncate max-w-[110px] mr-1">
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
            <div
              className={`flex ${
                nftTokenData?.name ? 'pr-[1.3rem]' : 'pr-[0.9rem]'
              }`}
            >
              <div className="flex-1 w-full break-words">
                <div className="flex mb-1">
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
                    <span className="mr-1">
                      {getTimeAgoString(
                        nanoToMilli(accountData.created.block_timestamp),
                      )}
                    </span>
                    {!deploymentData?.receipt_predecessor_account_id && (
                      <span>
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
                  'Genesis'
                ) : (
                  'N/A'
                )}
              </div>
            </div>
            {genesis && (
              <div>
                {contract && contract?.hash ? (
                  <div className="flex-1 md:w-full">
                    <div className="mb-2 whitespace-nowrap md:mb-0">
                      Contract Locked:
                    </div>
                    <div className="w-full break-words">
                      {contract?.code_base64 && isLocked ? 'Yes' : 'No'}
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
