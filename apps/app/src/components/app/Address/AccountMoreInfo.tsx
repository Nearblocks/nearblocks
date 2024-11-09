'use client';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

import useRpc from '@/hooks/app/useRpc';
import { Link } from '@/i18n/routing';
import {
  convertToUTC,
  localFormat,
  nanoToMilli,
  shortenAddress,
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
}: any) {
  const { contractCode, viewAccessKeys, viewAccount } = useRpc();
  const [contract, setContract] = useState<ContractCodeInfo | null>(null);
  const [accountView, setAccountView] = useState<AccountDataInfo | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    const loadSchema = async () => {
      try {
        const [code, keys, account]: any = await Promise.all([
          contractCode(id as string).catch((error: any) => {
            console.error(`Error fetching contract code for ${id}:`, error);
            return null;
          }),

          viewAccessKeys(id as string).catch((error: any) => {
            console.error(`Error fetching access keys for ${id}:`, error);
            return null;
          }),

          viewAccount(id as string).catch((error: any) => {
            console.error(`Error fetching account for ${id}:`, error);
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

        if (account) {
          setAccountView(account);
        } else {
          setAccountView(null);
        }
        setIsLocked(locked);
      } catch (error) {
        console.error('Error loading schema:', error);
      }
    };
    loadSchema();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="w-full">
      <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
        <h2 className="leading-6 border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
          {t('moreInfo') || 'Account information'}
        </h2>
        <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
          <div className="flex justify-between">
            <div className="flex xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
              <div className="w-full mb-2 md:mb-0">
                Staked {t('balance') || 'Balance'}:
              </div>

              <div className="w-full break-words xl:mt-0 mt-2">
                {accountData?.locked
                  ? yoctoToNear(accountData?.locked, true) + ' Ⓝ'
                  : accountData?.locked ?? ''}
              </div>
            </div>
            <div className="flex ml-4  xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
              <div className="w-full mb-2 md:mb-0">
                {t('storageUsed') || 'Storage used'}:
              </div>

              <div className="w-full break-words xl:mt-0 mt-2">
                {accountData?.storage_usage
                  ? weight(accountData?.storage_usage)
                  : accountData?.storage_usage ?? ''}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <div className="flex xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
              <div className="w-full mb-2 md:mb-0">
                {accountView !== null &&
                accountView?.block_hash === undefined &&
                accountData?.deleted?.transaction_hash
                  ? 'Deleted At:'
                  : 'Created At:'}
              </div>

              <div className="w-full break-words xl:mt-0 mt-2">
                {accountView !== null &&
                accountView?.block_hash === undefined &&
                accountData?.deleted?.transaction_hash
                  ? convertToUTC(
                      nanoToMilli(accountData.deleted.block_timestamp),
                      false,
                    )
                  : accountData?.created?.transaction_hash
                  ? convertToUTC(
                      nanoToMilli(accountData.created.block_timestamp),
                      false,
                    )
                  : accountData?.code_hash
                  ? 'Genesis'
                  : 'N/A'}
              </div>
            </div>
            {contract && contract?.hash ? (
              <div className="flex ml-4 xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
                <div className="w-full mb-2 md:mb-0">Contract Locked:</div>
                <div className="w-full break-words xl:mt-0 mt-2">
                  {contract?.code_base64 && isLocked ? 'Yes' : 'No'}
                </div>
              </div>
            ) : (
              <div className="flex ml-4 xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full" />
            )}
          </div>
          {deploymentData?.receipt_predecessor_account_id && (
            <div className="flex flex-wrap items-center justify-between py-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                Contract Creator:
              </div>
              <div className="w-full md:w-3/4 break-words">
                <Link
                  className="text-green-500 dark:text-green-250 hover:no-underline"
                  href={`/address/${deploymentData.receipt_predecessor_account_id}`}
                >
                  {shortenAddress(
                    deploymentData.receipt_predecessor_account_id ?? '',
                  )}
                </Link>
                {' at txn  '}
                <Link
                  className="text-green-500 dark:text-green-250 hover:no-underline"
                  href={`/txns/${deploymentData.transaction_hash}`}
                >
                  {shortenAddress(deploymentData.transaction_hash ?? '')}
                </Link>
              </div>
            </div>
          )}
          {tokenData?.name && (
            <div className="flex flex-wrap items-center justify-between py-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">Token Tracker:</div>
              <div className="w-full md:w-3/4 break-words">
                <div className="flex items-center">
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
                  {tokenData.price && (
                    <div className="text-nearblue-600 dark:text-neargray-10 ml-1">
                      (@ ${localFormat(tokenData.price)})
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {nftTokenData?.name && (
            <div className="flex flex-wrap items-center justify-between py-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                NFT Token Tracker:
              </div>
              <div className="w-full md:w-3/4 break-words">
                <div className="flex items-center">
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
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
