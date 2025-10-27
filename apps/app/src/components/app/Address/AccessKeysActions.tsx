'use client';

import { use, useState } from 'react';
import ErrorMessage from '@/components/app/common/ErrorMessage';
import Table from '@/components/app/common/Table';
import TableSummary from '@/components/app/common/TableSummary';
import FaInbox from '@/components/app/Icons/FaInbox';
import Clock from '@/components/app/Icons/Clock';
import Tooltip from '@/components/app/common/Tooltip';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';
import Timestamp from '@/components/app/common/Timestamp';
import { yoctoToNear, nanoToMilli, capitalizeWords } from '@/utils/libs';
import { AccountKey, AccountKeyCountRes, AccountKeysRes } from 'nb-schemas';
import { useTranslations } from 'next-intl';

interface Props {
  dataPromise: Promise<AccountKeysRes>;
  countPromise: Promise<AccountKeyCountRes>;
}

interface PermissionData {
  receiverId?: string;
  methodNames?: Record<string, string>;
  allowance?: string;
}

const AccessKeysActions = ({ dataPromise, countPromise }: Props) => {
  const { data: keys, errors, meta } = use(dataPromise);
  const { data: countData } = use(countPromise);
  const count = countData?.count;
  const cursor = meta?.cursor;
  const t = useTranslations();
  const error = !keys || !!(errors && errors.length > 0);
  const [page, setPage] = useState(1);
  const [showWhen, setShowWhen] = useState(true);
  const toggleShowWhen = () => setShowWhen((s) => !s);

  const accessKeysInfo = keys || [];
  const accessKeysCount = Number(count) || 0;

  const getPermissionData = (permission: any): PermissionData | null => {
    if (!permission || typeof permission !== 'object') return null;
    return permission as PermissionData;
  };

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
            Access Key Created
          </div>
        );
      case 'DELETE_KEY':
      case 'DeleteKey':
        return (
          <div className="bg-red-50 py-1 flex items-center text-xs">
            Access Key Deleted
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

  const columns = [
    {
      cell: (key: AccountKey) => {
        const createdTime = key?.created?.block?.block_timestamp
          ? nanoToMilli(key?.created?.block?.block_timestamp)
          : '';
        const deletedTime = key?.deleted?.block?.block_timestamp
          ? nanoToMilli(key?.deleted?.block?.block_timestamp)
          : '';
        const txn = createdTime > deletedTime ? key?.created : key?.deleted;

        return (
          <span>
            {txn?.transaction_hash ? (
              <Tooltip
                className={'left-1/2 max-w-[200px]'}
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
          </span>
        );
      },
      header: 'Txn Hash',
      key: 'transaction_hash',
      tdClassName: 'px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider',
    },
    {
      cell: (key: AccountKey) => (
        <Tooltip
          className={'left-1/2 max-w-[200px]'}
          position="top"
          tooltip={key?.public_key}
        >
          <span className="truncate max-w-[120px] inline-block align-bottom">
            {key?.public_key}
          </span>
        </Tooltip>
      ),
      header: 'Public key',
      key: 'public_key',
      tdClassName:
        'pl-4 pr-1 py-4 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider',
    },
    {
      cell: (key: AccountKey) => (
        <span className="whitespace-nowrap">
          {key?.permission_kind === 'FUNCTION_CALL' ? (
            <div className="bg-blue-900/10 rounded px-4 h-6 flex items-center justify-center text-center text-xs">
              Limited
            </div>
          ) : (
            <div className="bg-blue-900/10 rounded px-4 h-6 flex items-center justify-center text-center text-xs">
              Full
            </div>
          )}
        </span>
      ),
      header: 'Access',
      key: 'permission_kind',
      tdClassName:
        'px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 items-center justify-center text-center',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider',
    },
    {
      cell: (key: AccountKey) => {
        const permissionData = getPermissionData(key?.permission);
        const receiverId = permissionData?.receiverId;
        return (
          <span className="text-sm text-nearblue-600 dark:text-neargray-10">
            {receiverId || ''}
          </span>
        );
      },
      header: 'Contract',
      key: 'contract',
      tdClassName:
        'px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 justify-start',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider',
    },
    {
      cell: (key: AccountKey) => {
        const permissionData = getPermissionData(key?.permission);
        const methodNames = permissionData?.methodNames;

        if (methodNames && typeof methodNames === 'object') {
          const methodValues = Object.values(methodNames);
          if (methodValues.length > 0) {
            return (
              <div className="flex flex-col">
                {methodValues.map((method, index) => (
                  <div key={index}>{showMethod(method)}</div>
                ))}
              </div>
            );
          }
        }

        return (
          <span className="text-sm text-nearblue-600 dark:text-neargray-10">
            {key?.permission_kind === 'FUNCTION_CALL' ? 'Any' : ''}
          </span>
        );
      },
      header: 'Method',
      key: 'method',
      tdClassName:
        'px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 justify-start',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider',
    },
    {
      cell: (key: AccountKey) => {
        const permissionData = getPermissionData(key?.permission);
        const allowance = permissionData?.allowance;
        return (
          <span className="text-sm text-nearblue-600 dark:text-neargray-10">
            {allowance != null ? 'Ⓝ ' + yoctoToNear(allowance, true) : ''}
          </span>
        );
      },
      header: 'Allowance',
      key: 'allowance',
      tdClassName:
        'px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider',
    },
    {
      cell: (key: AccountKey) => {
        const createdTime = key?.created?.block?.block_timestamp
          ? nanoToMilli(key?.created?.block?.block_timestamp)
          : '';
        const deletedTime = key?.deleted?.block?.block_timestamp
          ? nanoToMilli(key?.deleted?.block?.block_timestamp)
          : '';
        const action =
          key?.deleted?.transaction_hash && createdTime <= deletedTime
            ? 'Deleted'
            : 'Created';

        return (
          <span className="text-sm text-nearblue-600 dark:text-neargray-10">
            {action}
          </span>
        );
      },
      header: 'Action',
      key: 'action',
      tdClassName:
        'px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider',
    },
    {
      cell: (key: AccountKey) => {
        const createdTime = key?.created?.block?.block_timestamp
          ? nanoToMilli(key?.created?.block?.block_timestamp)
          : '';
        const deletedTime = key?.deleted?.block?.block_timestamp
          ? nanoToMilli(key?.deleted?.block?.block_timestamp)
          : '';
        const txn = createdTime > deletedTime ? key?.created : key?.deleted;

        return (
          <span className="text-sm text-nearblue-600 dark:text-neargray-10">
            {txn?.block?.block_timestamp ? (
              <Timestamp
                showAge={showWhen}
                timestamp={txn?.block?.block_timestamp}
              />
            ) : (
              'Genesis'
            )}
          </span>
        );
      },
      header: (
        <div className="w-full inline-flex px-4 py-4">
          <Tooltip
            className={'left-1/2 max-w-[200px] top-6'}
            position="bottom"
            tooltip={
              <span className="flex flex-wrap">
                <span className="whitespace-nowrap">Click to show</span>{' '}
                <span className="whitespace-nowrap">
                  {showWhen ? 'Datetime' : 'Age'} Format
                </span>
              </span>
            }
          >
            <button
              className="text-left text-xs w-full flex items-center font-semibold uppercase tracking-wider text-green-500 dark:text-green-250 focus:outline-none whitespace-nowrap"
              onClick={toggleShowWhen}
              type="button"
            >
              {showWhen ? 'When' : 'Date Time (UTC)'}
              {showWhen && (
                <Clock className="text-green-500 dark:text-green-250 ml-2" />
              )}
            </button>
          </Tooltip>
        </div>
      ),
      key: 'block_timestamp',
      tdClassName:
        'px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
      thClassName: '',
    },
  ];

  return (
    <>
      <TableSummary
        text={
          accessKeysInfo &&
          !error &&
          `A total of ${accessKeysCount || 0} access keys found`
        }
      />
      <Table
        columns={columns}
        cursor={cursor}
        cursorPagination={true}
        data={accessKeysInfo}
        Error={error}
        ErrorText={
          <ErrorMessage
            icons={<FaInbox />}
            message={
              accessKeysCount === 0 ? 'No access keys' : 'An error occurred'
            }
            mutedText="Please try again later"
          />
        }
        limit={25}
        page={page}
        setPage={setPage}
      />
    </>
  );
};

export default AccessKeysActions;
