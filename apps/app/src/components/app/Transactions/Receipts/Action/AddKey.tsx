import { useTranslations } from 'next-intl';

import FaKey from '@/components/app/Icons/FaKey';
import { Link } from '@/i18n/routing';
import { shortenAddress, shortenHex } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';
import { CopyButton } from '@/components/app/common/CopyButton';
import Tooltip from '@/components/app/common/Tooltip';

const AddKey = (props: TransactionActionInfo) => {
  const t = useTranslations();

  const accessKey = props.args.accessKey || props.args.access_key;
  const publicKey = props.args.publicKey || props.args.public_key;

  if (typeof accessKey?.permission !== 'object') {
    return (
      <div className="py-1">
        <FaKey className="inline-flex text-emerald-400 mr-1" />{' '}
        {t ? t('txnDetails.actions.addKey.0') : 'New key'} (
        {publicKey && (
          <span>
            <span className="font-bold">
              <Tooltip
                tooltip={publicKey}
                position="top"
                className={
                  'left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-[280px] break-all sm:max-w-none sm:break-normal sm:w-max'
                }
                showArrow
              >
                {shortenHex(publicKey)}
              </Tooltip>
            </span>
            <span className="ml-0.5">
              <CopyButton textToCopy={publicKey} />
            </span>
          </span>
        )}
        ) {t ? t('txnDetails.actions.addKey.2') : 'added for'}
        <Link
          className="text-green-500 dark:text-green-250 font-bold hover:no-underline mx-1"
          href={`/address/${props.receiver}`}
        >
          {shortenAddress(props.receiver)}
        </Link>
        {t ? t('txnDetails.actions.addKey.4') : 'with permission'}
        <span className="font-bold ml-1">{accessKey?.permission}</span>
      </div>
    );
  }

  if (accessKey.permission.permission_kind) {
    return (
      <div className="py-1">
        <FaKey className="inline-flex text-gray-400 dark:text-neargray-10 mr-1" />{' '}
        {t ? t('txnDetails.actions.addKey.0') : 'New key'} (
        {publicKey && (
          <span>
            <span className="font-bold">
              <Tooltip
                tooltip={publicKey}
                position="top"
                className={
                  'left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-[280px] break-all sm:max-w-none sm:break-normal sm:w-max'
                }
                showArrow
              >
                {shortenHex(publicKey)}
              </Tooltip>
            </span>
            <span className="ml-0.5">
              <CopyButton textToCopy={publicKey} />
            </span>
          </span>
        )}
        ) {t ? t('txnDetails.actions.addKey.2') : 'added for'}
        <Link
          className="text-green-500 dark:text-green-250 font-bold hover:no-underline mx-1"
          href={`/address/${props.receiver}`}
        >
          {shortenAddress(props.receiver)}
        </Link>
        {t ? t('txnDetails.actions.addKey.4') : 'with permission'}{' '}
        <span className="font-bold ml-1">
          {accessKey.permission.permission_kind}
        </span>
      </div>
    );
  }

  const functionCall = accessKey.permission.FunctionCall;
  const receiverId = functionCall?.receiver_id || functionCall?.receiverId;
  const methodNames = functionCall?.method_names || functionCall?.methodNames;

  return (
    <div className="py-1">
      <FaKey className="inline-flex text-gray-400 dark:text-neargray-10 mr-1" />{' '}
      {t ? t('txnDetails.actions.addKey.1') : 'Access key'} (
      {publicKey && (
        <span className="font-bold">
          <Tooltip
            tooltip={publicKey}
            position="top"
            className={
              'left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-[280px] break-all sm:max-w-none sm:break-normal sm:w-max'
            }
            showArrow
          >
            {shortenHex(publicKey)}
          </Tooltip>
          <span className="ml-0.5">
            <CopyButton textToCopy={publicKey} />
          </span>
        </span>
      )}
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
        {methodNames && methodNames.length > 0 ? methodNames.join(', ') : 'any'}{' '}
      </span>
      {t ? t('txnDetails.actions.addKey.6') : 'methods'}
    </div>
  );
};

export default AddKey;
