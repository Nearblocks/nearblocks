import { useTranslations } from 'next-intl';

import FaCoins from '@/components/app/Icons/FaCoins';
import { shortenHex, yoctoToNear } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';
import Tooltip from '@/components/app/common/Tooltip';
import { CopyButton } from '@/components/app/common/CopyButton';

const Stake = (props: TransactionActionInfo) => {
  const t = useTranslations();
  const { args } = props;
  const publicKey = args?.public_key || args?.publicKey;

  return (
    <div className="py-1">
      <span className="whitespace-nowrap">
        <FaCoins className="inline-flex text-yellow-500 mr-1" />
        {t ? t('txnDetails.actions.stake.0') : 'Staked'}
      </span>
      <span className="font-bold mx-1">
        {args?.stake ? yoctoToNear(args?.stake, true) : args?.stake ?? ''}Ⓝ
      </span>
      <span>{t ? t('txnDetails.actions.stake.1') : 'with'} </span>
      {publicKey && (
        <>
          <Tooltip
            tooltip={publicKey}
            position="top"
            className={
              'left-1/2 md:-ml-0 -ml-14 w-[calc(100vw-8rem)] max-w-[280px] break-all sm:max-w-none sm:break-normal sm:w-max'
            }
            showArrow
          >
            {shortenHex(publicKey)}
          </Tooltip>
          <span className="ml-0.5">
            <CopyButton textToCopy={publicKey} />
          </span>
        </>
      )}
    </div>
  );
};

export default Stake;
