import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

import { Link } from '@/i18n/routing';
import { shortenHex } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';

import FaRight from '@/components/app/Icons/FaRight';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';
import { CopyButton } from '../../common/CopyButton';
import Tooltip from '../../common/Tooltip';

const AddKey = (props: TransactionActionInfo) => {
  const params = useParams();
  const t = useTranslations();

  const getPermissionString = (permission: any): string => {
    if (typeof permission === 'string') {
      return permission;
    }
    if (
      permission &&
      typeof permission === 'object' &&
      permission.permission_kind
    ) {
      return permission.permission_kind;
    }
    return '';
  };

  const hasPermissionKind = (permission: any): boolean => {
    return (
      permission && typeof permission === 'object' && permission.permission_kind
    );
  };

  const hasFunctionCall = (permission: any): boolean => {
    return (
      permission && typeof permission === 'object' && permission.FunctionCall
    );
  };

  const accessKeyPermission = props?.args?.accessKey?.permission;
  const access_keyPermission = props?.args?.access_key?.permission;
  const currentPermission = accessKeyPermission || access_keyPermission;

  if (typeof currentPermission !== 'object') {
    return (
      <div className="py-1 flex flex-wrap items-center">
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
        <span className="font-bold">{shortenHex(props?.args?.publicKey)}</span>){' '}
        {t ? t('txnDetails.actions.addKey.2') : 'added for'}
        <AddressOrTxnsLink currentAddress={props.receiver} />
        {t ? t('txnDetails.actions.addKey.4') : 'with permission'}
        <span className="font-bold ml-1">
          {getPermissionString(currentPermission)}
        </span>
      </div>
    );
  }

  if (
    hasPermissionKind(accessKeyPermission) ||
    hasPermissionKind(access_keyPermission)
  ) {
    return (
      <div className="py-1 flex flex-wrap items-center">
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
        <span className="font-bold">
          <Tooltip
            tooltip={props.args.public_key || props.args.publicKey}
            position="top"
            className={
              'left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-[280px] break-all sm:max-w-none sm:break-normal sm:w-max'
            }
            showArrow
          >
            {shortenHex(props.args.public_key || props.args.publicKey)}
          </Tooltip>
          <CopyButton
            textToCopy={props.args.public_key || props.args.publicKey}
          />
        </span>
        ) {t ? t('txnDetails.actions.addKey.2') : 'added for'}{' '}
        <AddressOrTxnsLink currentAddress={props.receiver} />
        {t ? t('txnDetails.actions.addKey.4') : 'with permission'}{' '}
        <span className="font-bold ml-1">
          {getPermissionString(accessKeyPermission || access_keyPermission)}
        </span>
      </div>
    );
  }

  return (
    <div className="py-1 flex flex-wrap items-center">
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
      <span className="font-bold">
        <Tooltip
          tooltip={props.args.publicKey}
          position="top"
          className={
            'left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-[280px] break-all sm:max-w-none sm:break-normal sm:w-max'
          }
          showArrow
        >
          {shortenHex(props.args.publicKey)}
        </Tooltip>
      </span>
      <span className="ml-0.5">
        <CopyButton textToCopy={props.args.publicKey} />
      </span>{' '}
      ) {t ? t('txnDetails.actions.addKey.2') : 'added for'}
      <span className="ml-1">
        {t ? t('txnDetails.actions.addKey.3') : 'contract'}
      </span>
      <AddressOrTxnsLink
        currentAddress={
          hasFunctionCall(accessKeyPermission)
            ? (accessKeyPermission as any).FunctionCall?.receiverId
            : hasFunctionCall(access_keyPermission)
            ? (access_keyPermission as any).FunctionCall?.receiver_id
            : undefined
        }
      />
      {t ? t('txnDetails.actions.addKey.4') : 'with permission'}
      <span className="mx-1">
        {t ? t('txnDetails.actions.addKey.5') : 'to call'}
      </span>
      <span className="font-bold mr-1">
        {(() => {
          const functionCallPermission = hasFunctionCall(accessKeyPermission)
            ? (accessKeyPermission as any).FunctionCall
            : hasFunctionCall(access_keyPermission)
            ? (access_keyPermission as any).FunctionCall
            : null;

          if (functionCallPermission?.method_names?.length > 0) {
            return functionCallPermission.method_names.join(', ');
          }
          return 'any';
        })()}
      </span>
      {t ? t('txnDetails.actions.addKey.6') : 'methods'}
    </div>
  );
};

export default AddKey;
