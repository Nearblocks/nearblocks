import { useTranslations } from 'next-intl';

import FaCoins from '@/components/app/Icons/FaCoins';
import { shortenHex, yoctoToNear } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';

import TreeNode from '../TreeNode';
import Tooltip from '@/components/app/common/Tooltip';
import { CopyButton } from '@/components/app/common/CopyButton';

const Stake = (props: TransactionActionInfo) => {
  const { action, args } = props;
  const t = useTranslations();
  const publicKey = args?.public_key || args?.publicKey;

  return (
    <>
      <div className="py-1">
        <FaCoins className="inline-flex text-yellow-500" />{' '}
        {t ? t('txnDetails.actions.stake.0') : 'Staked'}{' '}
        <span className="font-bold mr-1">
          {args?.stake ? yoctoToNear(args.stake, true) : args.stake ?? ''}Ⓝ
        </span>{' '}
        {t ? t('txnDetails.actions.stake.1') : 'with'}{' '}
        {publicKey && (
          <>
            <Tooltip
              tooltip={publicKey}
              position="bottom"
              className={
                'left-1/2 -ml-28 w-[calc(100vw-2rem)] max-w-[280px] break-all sm:max-w-none sm:break-normal sm:w-max'
              }
              showArrow
            >
              {shortenHex(publicKey)}
            </Tooltip>
            <span>
              <CopyButton textToCopy={publicKey} />
            </span>
          </>
        )}
      </div>
      <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
        <TreeNode node={action} path="root" />
      </div>
    </>
  );
};

export default Stake;
