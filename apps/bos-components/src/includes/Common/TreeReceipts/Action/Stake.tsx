import FaCoins from '@/includes/icons/FaCoins';
import { TransactionActionInfo } from '@/includes/types';

const Stake = (props: TransactionActionInfo) => {
  const { t, args, action, ownerId } = props;
  const { yoctoToNear } = VM.require(`${ownerId}/widget/includes.Utils.libs`);

  const { shortenHex } = VM.require(`${ownerId}/widget/includes.Utils.formats`);

  return (
    <>
      <div className="py-1">
        <FaCoins className="inline-flex text-yellow-500 mr-1" />
        {t ? t('txns:txn.actions.stake.0') : 'Staked'}
        <span className="font-bold">
          {args.stake ? yoctoToNear(args.stake, true) : args.stake ?? ''}Ⓝ
        </span>{' '}
        {t ? t('txns:txn.actions.stake.1') : 'with'}{' '}
        {shortenHex(args.public_key)}
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

export default Stake;
