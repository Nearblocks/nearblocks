import FaUser from '@/includes/icons/FaUser';
import { TransactionActionInfo } from '@/includes/types';

const CreateAccount = (props: TransactionActionInfo) => {
  const { action, ownerId } = props;

  const { shortenAddress } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  return (
    <>
      <div className="py-1">
        <FaUser className="inline-flex text-emerald-400 mr-1" />{' '}
        {props.t ? props.t('txns:txn.actions.createAccount.0') : 'New account'}{' '}
        (
        <a href={`/address/${props.receiver}`} className="hover:no-underline">
          <a className="text-green-500 dark:text-green-250 font-bold hover:no-underline">
            {shortenAddress(props.receiver)}
          </a>
        </a>
        ) {props.t ? props.t('txns:txn.actions.createAccount.1') : 'created'}
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

export default CreateAccount;
