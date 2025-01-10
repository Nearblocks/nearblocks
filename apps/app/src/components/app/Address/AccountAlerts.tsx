'use client';
import { useCallback, useEffect, useState } from 'react';

import useRpc from '@/hooks/app/useRpc';
import { convertToUTC, nanoToMilli } from '@/utils/app/libs';
import { AccountDataInfo, ContractCodeInfo, KeysInfo } from '@/utils/types';

import WarningIcon from '../Icons/WarningIcon';

export default function AccountAlerts({
  accountData,
  id,
}: {
  accountData: any;
  id: string;
}) {
  const { contractCode, viewAccessKeys, viewAccount } = useRpc();
  const [contract, setContract] = useState<ContractCodeInfo | null>(null);
  const [accountView, setAccountView] = useState<AccountDataInfo | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isAccountLoading, setIsAccountLoading] = useState(true);
  const [isContractLoading, setIsContractLoading] = useState(true);
  const [accessKeys, setAccessKeys] = useState<[] | KeysInfo>([]);

  const loadSchema = useCallback(async () => {
    if (!id) return;

    try {
      const [code, keys, account]: any = await Promise.all([
        contractCode(id).catch(() => {
          return null;
        }),
        viewAccessKeys(id).catch((error: any) => {
          console.log(`Error fetching access keys for ${id}:`, error);
          return null;
        }),
        viewAccount(id).catch(() => {
          return null;
        }),
      ]);

      if (code?.code_base64) {
        setContract((prev) => {
          if (!prev || prev.hash !== code.hash) {
            return {
              block_hash: code.block_hash,
              block_height: code.block_height,
              code_base64: code.code_base64,
              hash: code.hash,
            };
          }
          return prev;
        });
        setIsContractLoading(false);
      } else {
        setContract((prev) => (prev ? null : prev));
        setIsContractLoading(false);
      }

      const locked = (account?.keys || []).every(
        (key: { access_key: { permission: string } }) =>
          key.access_key.permission !== 'FullAccess',
      );

      setIsLocked(locked);

      if (account) {
        setAccountView((prev) => {
          if (!prev || prev.account_id !== account.account_id) {
            return account;
          }
          return prev;
        });
        setIsAccountLoading(false);
      } else {
        setAccountView((prev) => (prev ? null : prev));
        setIsAccountLoading(false);
      }

      if (keys?.keys?.length > 0) {
        setAccessKeys((prev) => {
          const isSame = JSON.stringify(prev) === JSON.stringify(keys?.keys);
          return isSame ? prev : keys?.keys;
        });
      }
    } catch (error) {
      console.error('Error loading schema:', error);
    }
  }, [id, contractCode, viewAccount, viewAccessKeys]);

  useEffect(() => {
    loadSchema();
  }, [loadSchema]);

  if (
    !accountView &&
    accountData?.deleted?.transaction_hash &&
    !isAccountLoading
  ) {
    return (
      <>
        <div className="block lg:flex lg:space-x-2">
          <div className="w-full">
            <div className="h-full w-full inline-block border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-600 rounded-lg p-4 text-sm dark:bg-yellow-400/[0.10] dark:text-nearyellow-400 dark:border dark:border-yellow-400/60">
              <p className="mb-0 items-center break-words">
                <WarningIcon className="w-5 h-5 fill-current mx-1 inline-block text-red-600" />
                {`This account was deleted on ${
                  accountData?.deleted?.transaction_hash
                    ? convertToUTC(
                        nanoToMilli(accountData.deleted.block_timestamp),
                        false,
                      )
                    : ''
                }`}
              </p>
            </div>
          </div>
        </div>
        <div className="py-2"></div>
      </>
    );
  }

  if (
    accountView !== null &&
    isLocked &&
    accountData &&
    accountData?.deleted?.transaction_hash === null &&
    Object.keys(accessKeys)?.length === 0 &&
    contract === null &&
    !isContractLoading
  ) {
    return (
      <>
        <div className="block lg:flex lg:space-x-2">
          <div className="w-full">
            <div className="h-full w-full inline-block border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-600 rounded-lg p-4 text-sm dark:bg-yellow-400/[0.10] dark:text-nearyellow-400 dark:border dark:border-yellow-400/60">
              <p className="mb-0 items-center">
                <WarningIcon className="w-5 h-5 fill-current mx-1 inline-block text-red-600" />
                This account has no full access keys
              </p>
            </div>
          </div>
        </div>
        <div className="py-2"></div>
      </>
    );
  }

  return null;
}
