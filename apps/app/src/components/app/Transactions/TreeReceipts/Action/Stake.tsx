import { useTranslations } from 'next-intl';

import FaCoins from '@/components/Icons/FaCoins';
import { shortenHex, yoctoToNear } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';

import TreeNode from '../TreeNode';

const Stake = (props: TransactionActionInfo) => {
  const { action, args } = props;
  const t = useTranslations();

  return (
    <>
      <div className="py-1">
        <FaCoins className="inline-flex text-yellow-500 mr-1" />
        {t ? t('txn.actions.stake.0') : 'Staked'}
        <span className="font-bold">
          {args.stake ? yoctoToNear(args.stake, true) : args.stake ?? ''}Ⓝ
        </span>{' '}
        {t ? t('txn.actions.stake.1') : 'with'} {shortenHex(args.public_key)}
      </div>
      <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
        <TreeNode node={action} path="root" />
      </div>
    </>
  );
};

export default Stake;
