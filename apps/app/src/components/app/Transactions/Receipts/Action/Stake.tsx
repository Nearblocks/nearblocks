import { useTranslations } from 'next-intl';

import FaCoins from '@/components/app/Icons/FaCoins';
import { shortenHex, yoctoToNear } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';

const Stake = (props: TransactionActionInfo) => {
  const t = useTranslations();

  const { args } = props;

  return (
    <div className="py-1">
      <span className="whitespace-nowrap">
        <FaCoins className="inline-flex text-yellow-500 mr-1" />
        {t ? t('txnDetails.actions.stake.0') : 'Staked'}
      </span>
      <span className="font-bold mx-1">
        {args?.stake ? yoctoToNear(args?.stake, true) : args?.stake ?? ''}Ⓝ
      </span>
      <span className="mx-1">
        {t ? t('txnDetails.actions.stake.1') : 'with'}
      </span>
      {shortenHex(args?.public_key || args?.publicKey)}
    </div>
  );
};

export default Stake;
