import { useTranslations } from 'next-intl';

import FaKey from '@/components/app/Icons/FaKey';
import { Link } from '@/i18n/routing';
import { shortenAddress, shortenHex } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';
import { CopyButton } from '@/components/app/common/CopyButton';

import TreeNode from '@/components/app/Transactions/TreeReceipts/TreeNode';

const AddKey = (props: TransactionActionInfo) => {
  const { action } = props;
  const t = useTranslations();

  const accessKey = props?.args?.accessKey || props?.args?.access_key;
  const publicKey = props?.args?.publicKey || props?.args?.public_key;

  if (typeof accessKey?.permission !== 'object') {
    return (
      <>
        <div className="py-1">
          <FaKey className="inline-flex text-emerald-400 mr-1" />{' '}
          {t ? t('txnDetails.actions.addKey.0') : 'New key'} (
          <span className="font-bold">
            {shortenHex(publicKey)}
            {publicKey && (
              <span className="ml-0.5">
                <CopyButton textToCopy={publicKey} />
              </span>
            )}
          </span>
          ) {t ? t('txnDetails.actions.addKey.2') : 'added for'}
          <Link
            className="text-green-500 dark:text-green-250 font-bold hover:no-underline mx-1"
            href={`/address/${props?.receiver}`}
          >
            {shortenAddress(props?.receiver)}
          </Link>
          {t ? t('txnDetails.actions.addKey.4') : 'with permission'}
          <span className="font-bold ml-1">{accessKey?.permission}</span>
        </div>
        <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
          <TreeNode node={action} path="root" />
        </div>
      </>
    );
  }

  if (accessKey?.permission?.permission_kind) {
    return (
      <>
        <div className="py-1">
          <FaKey className="inline-flex text-gray-400 dark:text-neargray-10 mr-1" />{' '}
          {t ? t('txnDetails.actions.addKey.0') : 'New key'} (
          <span className="font-bold">
            {shortenHex(publicKey)}
            {publicKey && (
              <span className="ml-0.5">
                <CopyButton textToCopy={publicKey} />
              </span>
            )}
          </span>
          ) {t ? t('txnDetails.actions.addKey.2') : 'added for'}
          <Link
            className="text-green-500 dark:text-green-250 font-bold hover:no-underline mx-1"
            href={`/address/${props?.receiver}`}
          >
            {shortenAddress(props?.receiver)}
          </Link>
          {t ? t('txnDetails.actions.addKey.4') : 'with permission'}{' '}
          <span className="font-bold ml-1">
            {accessKey?.permission?.permission_kind}
          </span>
        </div>
        <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
          <TreeNode node={action} path="root" />
        </div>
      </>
    );
  }

  const functionCall = accessKey?.permission?.FunctionCall;
  const receiverId = functionCall?.receiver_id || functionCall?.receiverId;
  const methodNames = functionCall?.method_names || functionCall?.methodNames;

  return (
    <>
      <div className="py-1">
        <FaKey className="inline-flex text-gray-400 dark:text-neargray-10 mr-1" />{' '}
        {t ? t('txnDetails.actions.addKey.1') : 'Access key'} (
        <span className="font-bold">
          {shortenHex(publicKey)}
          {publicKey && (
            <span className="ml-0.5">
              <CopyButton textToCopy={publicKey} />
            </span>
          )}
        </span>
        ) {t ? t('txnDetails.actions.addKey.2') : 'added for'}
        <span className="mx-1">
          {t ? t('txnDetails.actions.addKey.3') : 'contract'}
        </span>
        <Link
          className="text-green-500 dark:text-green-250 font-bold hover:no-underline mr-1"
          href={`/address/${receiverId}`}
        >
          {shortenAddress(receiverId)}
        </Link>
        {t ? t('txnDetails.actions.addKey.4') : 'with permission'}
        <span className="mx-1">
          {t ? t('txnDetails.actions.addKey.5') : 'to call'}
        </span>
        <span className="font-bold">
          {methodNames && methodNames?.length > 0
            ? methodNames.join(', ')
            : 'any'}{' '}
        </span>
        {t ? t('txnDetails.actions.addKey.6') : 'methods'}
      </div>
      <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
        <TreeNode node={action} path="root" />
      </div>
    </>
  );
};

export default AddKey;
