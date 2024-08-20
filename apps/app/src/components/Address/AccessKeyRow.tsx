import useRpc from '@/hooks/useRpc';
import {
  formatTimestampToString,
  getTimeAgoString,
  capitalizeWords,
  nanoToMilli,
  yoctoToNear,
} from '@/utils/libs';
import { AccessInfo, AccountContractInfo } from '@/utils/types';
import { Tooltip } from '@reach/tooltip';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Props {
  accessKey: AccountContractInfo;
  showWhen: boolean;
}

const AccessKeyRow = ({ accessKey, showWhen }: Props) => {
  const { t } = useTranslation();
  const [keyInfo, setKeyInfo] = useState<AccessInfo>({} as AccessInfo);
  const { viewAccessKey } = useRpc();
  const createdTime = accessKey.created?.block_timestamp
    ? nanoToMilli(accessKey.created?.block_timestamp)
    : '';
  const deletedTime = accessKey.deleted?.block_timestamp
    ? nanoToMilli(accessKey.deleted?.block_timestamp)
    : '';

  const txn = createdTime > deletedTime ? accessKey.created : accessKey.deleted;

  const action =
    accessKey.deleted?.transaction_hash && createdTime <= deletedTime
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
    if (accessKey.public_key && accessKey.permission_kind === 'FUNCTION_CALL') {
      viewAccessKey(accessKey.account_id, accessKey.public_key)
        .then(setKeyInfo)
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessKey]);

  return (
    <>
      <tr key={accessKey.public_key} className="hover:bg-blue-900/5">
        <td className="px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10">
          {txn?.transaction_hash ? (
            <Tooltip
              label={txn?.transaction_hash}
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2 break-words"
            >
              <span className="truncate max-w-[120px] inline-block align-bottom text-green-500 dark:text-green-250 font-medium whitespace-nowrap">
                <Link
                  href={`/txns/${txn?.transaction_hash}`}
                  className="text-green-500 dark:text-green-250"
                >
                  {txn?.transaction_hash && txn?.transaction_hash}
                </Link>
              </span>
            </Tooltip>
          ) : (
            'Genesis'
          )}
        </td>
        <td className="pl-4 pr-1 py-4 text-sm text-nearblue-600  dark:text-neargray-10">
          <Tooltip
            label={accessKey.public_key}
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2 break-words"
          >
            <span className="truncate max-w-[120px] inline-block align-bottom ">
              {accessKey.public_key}
            </span>
          </Tooltip>
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 items-center justify-center text-center">
          {accessKey.permission_kind === 'FUNCTION_CALL' ? (
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
            Object.keys(keyInfo).length !== 0 &&
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
                : accessKey.permission_kind === 'FUNCTION_CALL'
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
            <Tooltip
              label={
                !showWhen
                  ? txn?.block_timestamp
                    ? getTimeAgoString(nanoToMilli(txn?.block_timestamp))
                    : ''
                  : txn?.block_timestamp
                  ? formatTimestampToString(nanoToMilli(txn?.block_timestamp))
                  : ''
              }
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2 break-words"
            >
              <span>
                {showWhen
                  ? txn?.block_timestamp
                    ? getTimeAgoString(nanoToMilli(txn?.block_timestamp))
                    : ''
                  : txn?.block_timestamp
                  ? formatTimestampToString(nanoToMilli(txn?.block_timestamp))
                  : ''}
              </span>
            </Tooltip>
          ) : (
            'Genesis'
          )}
        </td>
      </tr>
    </>
  );
};

export default AccessKeyRow;
