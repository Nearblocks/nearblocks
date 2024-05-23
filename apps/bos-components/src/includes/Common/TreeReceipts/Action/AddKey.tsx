import FaKey from '@/includes/icons/FaKey';
import { TransactionActionInfo } from '@/includes/types';

const AddKey = (props: TransactionActionInfo) => {
  const { action, ownerId } = props;

  const { shortenAddress } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  const { shortenHex } = VM.require(`${ownerId}/widget/includes.Utils.formats`);

  if (typeof props.args.access_key?.permission !== 'object') {
    return (
      <>
        <div className="py-1">
          <FaKey className="inline-flex text-emerald-400 mr-1" />{' '}
          {props.t ? props.t('txns:txn.actions.addKey.0') : 'New key'} (
          <span className="font-bold">{shortenHex(props.args.public_key)}</span>
          ) {props.t ? props.t('txns:txn.actions.addKey.2') : 'added for'}
          <a href={`/address/${props.receiver}`} className="hover:no-underline">
            <a className="text-green-500 dark:text-green-250 font-bold hover:no-underline">
              {shortenAddress(props.receiver)}
            </a>
          </a>{' '}
          {props.t ? props.t('txns:txn.actions.addKey.4') : 'with permission'}
          <span className="font-bold">{props.args.access_key?.permission}</span>
        </div>
        <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
          <Widget
            src={`${ownerId}/widget/includes.Common.TreeReceipts.TreeNode`}
            props={{
              node: action,
              path: 'root',
              ownerId,
            }}
          />
        </div>
      </>
    );
  }

  if (props.args.access_key.permission.permission_kind) {
    return (
      <>
        <div className="py-1">
          <FaKey className="inline-flex text-gray-400 dark:text-neargray-10 mr-1" />{' '}
          {props.t ? props.t('txns:txn.actions.addKey.0') : 'New key'} (
          <span className="font-bold">{shortenHex(props.args.public_key)}</span>
          ){props.t ? props.t('txns:txn.actions.addKey.2') : 'added for'}{' '}
          <a href={`/address/${props.receiver}`} className="hover:no-underline">
            <a className="text-green-500 dark:text-green-250 font-bold hover:no-underline">
              {shortenAddress(props.receiver)}
            </a>
          </a>{' '}
          {props.t ? props.t('txns:txn.actions.addKey.4') : 'with permission'}{' '}
          <span className="font-bold">
            {props.args.access_key.permission.permission_kind}
          </span>
        </div>
        <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
          <Widget
            src={`${ownerId}/widget/includes.Common.TreeReceipts.TreeNode`}
            props={{
              node: action,
              path: 'root',
              ownerId,
            }}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="py-1">
        <FaKey className="inline-flex text-gray-400 dark:text-neargray-10 mr-1" />{' '}
        {props.t ? props.t('txns:txn.actions.addKey.1') : 'Access key'} (
        <span className="font-bold">{shortenHex(props.args.public_key)}</span>){' '}
        {props.t ? props.t('txns:txn.actions.addKey.2') : 'added for'}
        {props.t ? props.t('txns:txn.actions.addKey.3') : 'contract'}
        <a
          href={`/address/${props.args.access_key.permission.FunctionCall.receiver_id}`}
          className="hover:no-underline"
        >
          <a className="text-green-500 dark:text-green-250 font-bold hover:no-underline">
            {shortenAddress(
              props.args.access_key.permission.FunctionCall.receiver_id,
            )}
          </a>
        </a>{' '}
        {props.t ? props.t('txns:txn.actions.addKey.4') : 'with permission'}
        {props.t ? props.t('txns:txn.actions.addKey.5') : 'to call'}
        <span className="font-bold">
          {props.args.access_key.permission.FunctionCall.method_names.length > 0
            ? props.args.access_key.permission.FunctionCall.method_names.join(
                ', ',
              )
            : 'any'}{' '}
        </span>
        {props.t ? props.t('txns:txn.actions.addKey.6') : 'methods'}
      </div>
      <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
        <Widget
          src={`${ownerId}/widget/includes.Common.TreeReceipts.TreeNode`}
          props={{
            node: action,
            path: 'root',
            ownerId,
          }}
        />
      </div>
    </>
  );
};

export default AddKey;
