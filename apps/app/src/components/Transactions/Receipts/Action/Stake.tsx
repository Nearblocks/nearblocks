import FaCoins from '@/components/Icons/FaCoins';
import { shortenHex, yoctoToNear } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';
import { useTranslations } from 'next-intl';

const Stake = (props: TransactionActionInfo) => {
  const t = useTranslations();

  const { args } = props;

  return (
    <div className="py-1">
      <FaCoins className="inline-flex text-yellow-500 mr-1" />
      {t ? t('txn.actions.stake.0') : 'Staked'}
      <span className="font-bold">
        {args?.stake ? yoctoToNear(args?.stake, true) : args?.stake ?? ''}Ⓝ
      </span>{' '}
      {t ? t('txn.actions.stake.1') : 'with'} {shortenHex(args?.public_key)}
    </div>
  );
};

export default Stake;
