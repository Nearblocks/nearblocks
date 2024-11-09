import { useTranslations } from 'next-intl';

import FaKey from '@/components/Icons/FaKey';
import { Link } from '@/i18n/routing';
import { shortenAddress, shortenHex } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';

import TreeNode from '../TreeNode';

const AddKey = (props: TransactionActionInfo) => {
  const { action } = props;
  const t = useTranslations();

  if (typeof props.args.access_key?.permission !== 'object') {
    return (
      <>
        <div className="py-1">
          <FaKey className="inline-flex text-emerald-400 mr-1" />{' '}
          {t ? t('txn.actions.addKey.0') : 'New key'} (
          <span className="font-bold">{shortenHex(props.args.public_key)}</span>
          ) {t ? t('txn.actions.addKey.2') : 'added for'}
          <Link
            className="text-green-500 dark:text-green-250 font-bold hover:no-underline mx-1"
            href={`/address/${props.receiver}`}
          >
            {shortenAddress(props.receiver)}
          </Link>
          {t ? t('txn.actions.addKey.4') : 'with permission'}
          <span className="font-bold ml-1">
            {props.args.access_key?.permission}
          </span>
        </div>
        <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
          <TreeNode node={action} path="root" />
        </div>
      </>
    );
  }

  if (props.args.access_key.permission.permission_kind) {
    return (
      <>
        <div className="py-1">
          <FaKey className="inline-flex text-gray-400 dark:text-neargray-10 mr-1" />{' '}
          {t ? t('txn.actions.addKey.0') : 'New key'} (
          <span className="font-bold">{shortenHex(props.args.public_key)}</span>
          ){t ? t('txn.actions.addKey.2') : 'added for'}{' '}
          <Link
            className="text-green-500 dark:text-green-250 font-bold hover:no-underline"
            href={`/address/${props.receiver}`}
          >
            {shortenAddress(props.receiver)}
          </Link>
          {t ? t('txn.actions.addKey.4') : 'with permission'}{' '}
          <span className="font-bold">
            {props.args.access_key.permission.permission_kind}
          </span>
        </div>
        <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
          <TreeNode node={action} path="root" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="py-1">
        <FaKey className="inline-flex text-gray-400 dark:text-neargray-10 mr-1" />{' '}
        {t ? t('txn.actions.addKey.1') : 'Access key'} (
        <span className="font-bold">{shortenHex(props.args.public_key)}</span>){' '}
        {t ? t('txn.actions.addKey.2') : 'added for'}
        {t ? t('txn.actions.addKey.3') : 'contract'}
        <Link
          className="text-green-500 dark:text-green-250 font-bold hover:no-underline"
          href={`/address/${props.args.access_key.permission.FunctionCall.receiver_id}`}
        >
          {shortenAddress(
            props.args.access_key.permission.FunctionCall.receiver_id,
          )}
        </Link>
        {t ? t('txn.actions.addKey.4') : 'with permission'}
        {t ? t('txn.actions.addKey.5') : 'to call'}
        <span className="font-bold">
          {props.args.access_key.permission.FunctionCall.method_names.length > 0
            ? props.args.access_key.permission.FunctionCall.method_names.join(
                ', ',
              )
            : 'any'}{' '}
        </span>
        {t ? t('txn.actions.addKey.6') : 'methods'}
      </div>
      <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
        <TreeNode node={action} path="root" />
      </div>
    </>
  );
};

export default AddKey;
