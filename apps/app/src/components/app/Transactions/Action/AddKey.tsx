import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

import { Link } from '@/i18n/routing';
import { shortenHex } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';

import AddressLink from '../../common/AddressLink';
import FaRight from '../../Icons/FaRight';
import { useActionContext } from './ActionContext';

const AddKey = (props: TransactionActionInfo) => {
  const params = useParams();
  const t = useTranslations();
  const { address, handleMouseLeave, onHandleMouseOver } = useActionContext();
  if (typeof props.args.access_key?.permission !== 'object') {
    return (
      <div className="py-1">
        {props?.action?.receiptId && params?.hash ? (
          <Link
            href={`/txns/${params?.hash}?tab=execution#${props?.action?.receiptId}`}
          >
            <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs mr-1" />
          </Link>
        ) : (
          <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs mr-1" />
        )}
        {t ? t('txnDetails.actions.addKey.0') : 'New key'} (
        <span className="font-bold">{shortenHex(props.args.public_key)}</span>){' '}
        {t ? t('txnDetails.actions.addKey.2') : 'added for'}
        <AddressLink
          address={address}
          currentAddress={props.receiver}
          onMouseLeave={handleMouseLeave}
          onMouseOver={onHandleMouseOver}
        />
        {t ? t('txnDetails.actions.addKey.4') : 'with permission'}
        <span className="font-bold ml-1">
          {props.args.access_key?.permission}
        </span>
      </div>
    );
  }

  if (props.args.access_key.permission.permission_kind) {
    return (
      <div className="py-1">
        {props?.action?.receiptId && params?.hash ? (
          <Link
            href={`/txns/${params?.hash}?tab=execution#${props?.action?.receiptId}`}
          >
            <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs mr-1" />
          </Link>
        ) : (
          <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs mr-1" />
        )}
        {t ? t('txnDetails.actions.addKey.0') : 'New key'} (
        <span className="font-bold">{shortenHex(props.args.public_key)}</span>)
        {t ? t('txnDetails.actions.addKey.2') : 'added for'}{' '}
        <AddressLink
          address={address}
          currentAddress={props.receiver}
          onMouseLeave={handleMouseLeave}
          onMouseOver={onHandleMouseOver}
        />
        {t ? t('txnDetails.actions.addKey.4') : 'with permission'}{' '}
        <span className="font-bold ml-1">
          {props.args.access_key.permission.permission_kind}
        </span>
      </div>
    );
  }

  return (
    <div className="py-1">
      {props?.action?.receiptId && params?.hash ? (
        <Link
          href={`/txns/${params?.hash}?tab=execution#${props?.action?.receiptId}`}
        >
          <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs mr-1" />
        </Link>
      ) : (
        <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs mr-1" />
      )}
      {t ? t('txnDetails.actions.addKey.1') : 'Access key'} (
      <span className="font-bold">{shortenHex(props.args.public_key)}</span>){' '}
      {t ? t('txnDetails.actions.addKey.2') : 'added for'}
      <span className="mx-1">
        {t ? t('txnDetails.actions.addKey.3') : 'contract'}
      </span>
      <AddressLink
        address={address}
        currentAddress={
          props.args.access_key.permission.FunctionCall.receiver_id
        }
        onMouseLeave={handleMouseLeave}
        onMouseOver={onHandleMouseOver}
      />
      {t ? t('txnDetails.actions.addKey.4') : 'with permission'}
      <span className="mx-1">
        {t ? t('txnDetails.actions.addKey.5') : 'to call'}
      </span>
      <span className="font-bold">
        {props.args.access_key.permission.FunctionCall.method_names.length > 0
          ? props.args.access_key.permission.FunctionCall.method_names.join(
              ', ',
            )
          : 'any'}{' '}
      </span>
      {t ? t('txnDetails.actions.addKey.6') : 'methods'}
    </div>
  );
};

export default AddKey;
