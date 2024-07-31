import FaKey from '@/includes/icons/FaKey';
import { TransactionActionInfo } from '@/includes/types';

const DeleteKey = (props: TransactionActionInfo) => {
  const { t, args, action, ownerId } = props;
  const { shortenHex } = VM.require(`${ownerId}/widget/includes.Utils.formats`);

  return (
    <>
      <div className="py-1">
        <FaKey className="inline-flex text-red-400 mr-1" />{' '}
        {t ? t('txns:txn.actions.deleteKey.0') : 'Key'} (
        <span className="font-bold">{shortenHex(args.public_key)}</span>){' '}
        {t ? t('txns:txn.actions.deleteKey.1') : 'deleted'}
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

export default DeleteKey;
