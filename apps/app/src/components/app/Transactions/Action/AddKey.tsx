import FaRight from '@/components/Icons/FaRight';
import { Link } from '@/i18n/routing';
import { shortenAddress, shortenHex } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';
import { useTranslations } from 'next-intl';

const AddKey = (props: TransactionActionInfo) => {
  const t = useTranslations();
  if (typeof props.args.access_key?.permission !== 'object') {
    return (
      <div className="py-1">
        <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs mr-1" />
        {t ? t('txn.actions.addKey.0') : 'New key'} (
        <span className="font-bold">{shortenHex(props.args.public_key)}</span>){' '}
        {t ? t('txn.actions.addKey.2') : 'added for'}
        <Link
          href={`/address/${props.receiver}`}
          className="text-green-500 dark:text-green-250 font-bold hover:no-underline mx-1"
        >
          {shortenAddress(props.receiver)}
        </Link>
        {t ? t('txn.actions.addKey.4') : 'with permission'}
        <span className="font-bold ml-1">
          {props.args.access_key?.permission}
        </span>
      </div>
    );
  }

  if (props.args.access_key.permission.permission_kind) {
    return (
      <div className="py-1">
        <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs mr-1" />
        {t ? t('txn.actions.addKey.0') : 'New key'} (
        <span className="font-bold">{shortenHex(props.args.public_key)}</span>)
        {t ? t('txn.actions.addKey.2') : 'added for'}{' '}
        <Link
          href={`/address/${props.receiver}`}
          className="text-green-500 dark:text-green-250 font-bold hover:no-underline mx-1"
        >
          {shortenAddress(props.receiver)}
        </Link>
        {t ? t('txn.actions.addKey.4') : 'with permission'}{' '}
        <span className="font-bold ml-1">
          {props.args.access_key.permission.permission_kind}
        </span>
      </div>
    );
  }

  return (
    <div className="py-1">
      <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs mr-1" />
      {t ? t('txn.actions.addKey.1') : 'Access key'} (
      <span className="font-bold">{shortenHex(props.args.public_key)}</span>){' '}
      {t ? t('txn.actions.addKey.2') : 'added for'}
      <span className="mx-1">{t ? t('txn.actions.addKey.3') : 'contract'}</span>
      <Link
        href={`/address/${props.args.access_key.permission.FunctionCall.receiver_id}`}
        className="text-green-500 dark:text-green-250 font-bold hover:no-underline mr-1"
      >
        {shortenAddress(
          props.args.access_key.permission.FunctionCall.receiver_id,
        )}
      </Link>
      {t ? t('txn.actions.addKey.4') : 'with permission'}
      <span className="mx-1">{t ? t('txn.actions.addKey.5') : 'to call'}</span>
      <span className="font-bold">
        {props.args.access_key.permission.FunctionCall.method_names.length > 0
          ? props.args.access_key.permission.FunctionCall.method_names.join(
              ', ',
            )
          : 'any'}{' '}
      </span>
      {t ? t('txn.actions.addKey.6') : 'methods'}
    </div>
  );
};

export default AddKey;