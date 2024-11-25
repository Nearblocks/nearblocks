import { useTranslations } from 'next-intl';

import FaArrowAltCircleRight from '@/components/Icons/FaArrowAltCircleRight';
import { Link } from '@/i18n/routing';
import { shortenAddress, yoctoToNear } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';

const Transfer = (props: TransactionActionInfo) => {
  const t = useTranslations();

  const { args, receiver } = props;

  return (
    <div className="py-1">
      <FaArrowAltCircleRight className="inline-flex text-green-400 mr-1" />{' '}
      {t ? t('txnDetails.actions.transfer.0') : 'Transferred'}
      <span className="font-bold ml-1">
        {args.deposit ? yoctoToNear(args.deposit, true) : args.deposit ?? ''} Ⓝ
      </span>{' '}
      {t ? t('txnDetails.actions.transfer.1') : 'to'}
      <Link
        className="text-green-500 dark:text-green-250 font-bold hover:no-underline ml-1"
        href={`/address/${receiver}`}
      >
        {shortenAddress(receiver)}
      </Link>
    </div>
  );
};

export default Transfer;
