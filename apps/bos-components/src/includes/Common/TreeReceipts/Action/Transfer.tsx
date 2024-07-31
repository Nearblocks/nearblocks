import FaArrowAltCircleRight from '@/includes/icons/FaArrowAltCircleRight';
import { TransactionActionInfo } from '@/includes/types';

const Transfer = (props: TransactionActionInfo) => {
  const { t, args, receiver, action, ownerId } = props;
  const { shortenAddress, yoctoToNear } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  return (
    <>
      <div className="py-1">
        <FaArrowAltCircleRight className="inline-flex text-green-400 mr-1" />{' '}
        {t ? t('txns:txn.actions.transfer.0') : 'Transferred'}
        <span className="font-bold">
          {args.deposit ? yoctoToNear(args.deposit, true) : args.deposit ?? ''}{' '}
          Ⓝ
        </span>{' '}
        {t ? t('txns:txn.actions.transfer.1') : 'to'}
        <a href={`/address/${receiver}`} className="hover:no-underline">
          <a className="text-green-500 dark:text-green-250 font-bold hover:no-underline">
            {shortenAddress(receiver)}
          </a>
        </a>
      </div>
      <div className="mt-3 bg-gray-100 dark:bg-black-200 p-3 overflow-auto rounded-lg">
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

export default Transfer;
