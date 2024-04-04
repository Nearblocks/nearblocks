import FaUser from '@/includes/icons/FaUser';
import { TransactionActionInfo } from '@/includes/types';

const DeleteAccount = (props: TransactionActionInfo) => {
  const { shortenAddress } = VM.require(
    `${props.ownerId}/widget/includes.Utils.libs`,
  );
  return (
    <div className="py-1">
      <FaUser className="inline-flex text-red-400 mr-1" />
      {props.t
        ? props.t('txns:txn.actions.deleteAccount.0')
        : 'Delete account'}{' '}
      (
      <a href={`/address/${props.receiver}`} className="hover:no-underline">
        <a className="text-green-500 font-bold hover:no-underline">
          {shortenAddress(props.receiver)}
        </a>
      </a>
      ){' '}
      {props.t
        ? props.t('txns:txn.actions.deleteAccount.1')
        : 'and transfer remaining funds to'}
      <a
        href={`/address/${props.args.beneficiary_id}`}
        className="hover:no-underline"
      >
        <a className="text-green-500 font-bold hover:no-underline">
          {shortenAddress(props.args.beneficiary_id)}
        </a>
      </a>
    </div>
  );
};

export default DeleteAccount;
