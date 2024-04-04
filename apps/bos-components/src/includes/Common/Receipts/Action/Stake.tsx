import FaCoins from '@/includes/icons/FaCoins';
import { TransactionActionInfo } from '@/includes/types';

const Stake = (props: TransactionActionInfo) => {
  const { yoctoToNear } = VM.require(
    `${props.ownerId}/widget/includes.Utils.libs`,
  );

  const { shortenHex } = VM.require(
    `${props.ownerId}/widget/includes.Utils.formats`,
  );

  const { t, args } = props;

  return (
    <div className="py-1">
      <FaCoins className="inline-flex text-yellow-500 mr-1" />
      {t ? t('txns:txn.actions.stake.0') : 'Staked'}
      <span className="font-bold">
        {args.stake ? yoctoToNear(args.stake, true) : args.stake ?? ''}Ⓝ
      </span>{' '}
      {t ? t('txns:txn.actions.stake.1') : 'with'} {shortenHex(args.public_key)}
    </div>
  );
};

export default Stake;
