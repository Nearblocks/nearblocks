'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import useRpc from '@/hooks/app/useRpc';
import { capitalizeWords, nanoToMilli, yoctoToNear } from '@/utils/libs';
import { AccessInfo, AccountContractInfo } from '@/utils/types';

import Tooltip from '@/components/app/common/Tooltip';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';
import TimeStamp from '@/components/app/common/TimeStamp';

interface Props {
  accessKey: AccountContractInfo;
  showWhen: boolean;
}

const AccessKeyRow = ({ accessKey, showWhen }: Props) => {
  const t = useTranslations();
  const [keyInfo, setKeyInfo] = useState<AccessInfo>({} as AccessInfo);
  const { viewAccessKey } = useRpc();
  const createdTime = accessKey?.created?.block_timestamp
    ? nanoToMilli(accessKey?.created?.block_timestamp)
    : '';
  const deletedTime = accessKey?.deleted?.block_timestamp
    ? nanoToMilli(accessKey?.deleted?.block_timestamp)
    : '';

  const txn =
    createdTime > deletedTime ? accessKey?.created : accessKey?.deleted;

  const action =
    accessKey?.deleted?.transaction_hash && createdTime <= deletedTime
      ? 'Deleted'
      : 'Created';

  function showMethod(method: string) {
    switch (method) {
      case 'CREATE_ACCOUNT':
      case 'CreateAccount':
        return (
          <div className="py-1 flex items-center text-xs">
            {t('createAccount')}
          </div>
        );
      case 'DEPLOY_CONTRACT':
      case 'DeployContract':
        return (
          <div className="py-1 flex items-center text-xs">
            {t('deployContract')}
          </div>
        );
      case 'TRANSFER':
      case 'Transfer':
        return (
          <div className="bg-emerald-50 py-1 flex items-center text-xs">
            {t('transfer')}
          </div>
        );
      case 'STAKE':
      case 'Stake':
        return (
          <div className="py-1 flex items-center text-xs">{t('stake')}</div>
        );
      case 'ADD_KEY':
      case 'AddKey':
        return (
          <div className="py-1 flex items-center text-xs">
            Acces Key Created
          </div>
        );
      case 'DELETE_KEY':
      case 'DeleteKey':
        return (
          <div className="bg-red-50 py-1 flex items-center text-xs">
            Acces Key Deleted
          </div>
        );
      case 'DELETE_ACCOUNT':
      case 'DeleteAccount':
        return (
          <div className="bg-red-50 py-1 flex items-center text-xs">
            {t('deleteAccount')}
          </div>
        );

      default:
        return (
          <div className="py-1 flex items-center text-xs">
            {capitalizeWords(method)}
          </div>
        );
    }
  }

  useEffect(() => {
    if (
      accessKey?.public_key &&
      accessKey?.permission_kind === 'FUNCTION_CALL'
    ) {
      viewAccessKey(accessKey?.account_id, accessKey?.public_key)
        .then((data) => {
          if (data) {
            setKeyInfo(data);
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessKey]);

  return (
    <>
      <tr className="hover:bg-blue-900/5" key={accessKey?.public_key}>
        <td className="px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10">
          {txn?.transaction_hash ? (
            <Tooltip
              className={'left-1/2 ml-2 max-w-[200px] w-[150px]'}
              position="top"
              tooltip={txn?.transaction_hash}
            >
              <AddressOrTxnsLink
                copy
                txnHash={txn?.transaction_hash}
                className={
                  'truncate max-w-[120px] inline-block align-bottom whitespace-nowrap'
                }
              />
            </Tooltip>
          ) : (
            'Genesis'
          )}
        </td>
        <td className="pl-4 pr-1 py-4 text-sm text-nearblue-600  dark:text-neargray-10">
          <Tooltip
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={accessKey?.public_key}
          >
            <span className="truncate max-w-[120px] inline-block align-bottom ">
              {accessKey?.public_key}
            </span>
          </Tooltip>
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 items-center justify-center text-center">
          {accessKey?.permission_kind === 'FUNCTION_CALL' ? (
            <div className="bg-blue-900/10 rounded px-4 h-6 flex items-center justify-center text-center text-xs">
              Limited
            </div>
          ) : (
            <div className="bg-blue-900/10 rounded px-4 h-6 flex items-center justify-center text-center text-xs">
              Full
            </div>
          )}
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 justify-start">
          {keyInfo &&
            Object?.keys(keyInfo)?.length !== 0 &&
            keyInfo?.permission?.FunctionCall?.receiver_id}
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 justify-start">
          {keyInfo && keyInfo?.permission && (
            <div className="flex flex-col ">
              {keyInfo?.permission?.FunctionCall?.method_names.length > 0
                ? keyInfo?.permission?.FunctionCall?.method_names.map(
                    (method) => {
                      return <div key={method}>{showMethod(method)} </div>;
                    },
                  )
                : accessKey?.permission_kind === 'FUNCTION_CALL'
                ? 'Any'
                : 'Full Access'}
            </div>
          )}
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
          {keyInfo &&
            Object.keys(keyInfo).length !== 0 &&
            keyInfo?.permission?.FunctionCall?.allowance &&
            'Ⓝ ' +
              yoctoToNear(
                keyInfo?.permission?.FunctionCall?.allowance || '',
                true,
              )}
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
          {action}
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48">
          {txn?.block_timestamp ? (
            <TimeStamp showAge={showWhen} timestamp={txn?.block_timestamp} />
          ) : (
            'Genesis'
          )}
        </td>
      </tr>
    </>
  );
};

export default AccessKeyRow;
