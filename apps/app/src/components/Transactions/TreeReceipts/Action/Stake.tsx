import { TransactionActionInfo } from '@/utils/types';
import TreeNode from '../TreeNode';
import FaCoins from '@/components/Icons/FaCoins';
import useTranslation from 'next-translate/useTranslation';
import { shortenHex, yoctoToNear } from '@/utils/libs';

const Stake = (props: TransactionActionInfo) => {
  const { args, action } = props;
  const { t } = useTranslation();

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
        <TreeNode node={action} path="root" />
      </div>
    </>
  );
};

export default Stake;
