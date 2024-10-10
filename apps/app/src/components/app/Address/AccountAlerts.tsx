'use client';
import { convertToUTC, nanoToMilli } from '@/utils/app/libs';
import { useEffect, useState, useCallback } from 'react';
import WarningIcon from '../Icons/WarningIcon';
import useRpc from '@/hooks/useRpc';
import { AccountDataInfo, ContractCodeInfo } from '@/utils/types';

export default function AccountAlerts({
  id,
  accountData,
}: {
  id: string;
  accountData: any;
}) {
  const { contractCode, viewAccount } = useRpc();
  const [contract, setContract] = useState<ContractCodeInfo | null>(null);
  const [accountView, setAccountView] = useState<AccountDataInfo | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isAccountLoading, setIsAccountLoading] = useState(true);
  const [isContractLoading, setIsContractLoading] = useState(true);

  const loadSchema = useCallback(async () => {
    if (!id) return;

    try {
      const [code, keys, account]: any = await Promise.all([
        contractCode(id).catch((error) => {
          console.error(`Error fetching contract code for ${id}:`, error);
          return null;
        }),
        viewAccount(id).catch((error) => {
          console.error(`Error fetching account for ${id}:`, error);
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

      const locked = (keys?.keys || []).every(
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
    } catch (error) {
      console.error('Error loading schema:', error);
    }
  }, [id, contractCode, viewAccount]);

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
    accountView &&
    isLocked &&
    accountData &&
    !accountData?.deleted?.transaction_hash &&
    !contract &&
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
