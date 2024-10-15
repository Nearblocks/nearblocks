import FaArrowAltCircleRight from '@/components/Icons/FaArrowAltCircleRight';
import { Link } from '@/i18n/routing';
import { shortenAddress, yoctoToNear } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';
import { useTranslations } from 'next-intl';

const Transfer = (props: TransactionActionInfo) => {
  const t = useTranslations();

  const { args, receiver } = props;

  return (
    <div className="py-1">
      <FaArrowAltCircleRight className="inline-flex text-green-400 mr-1" />{' '}
      {t ? t('txn.actions.transfer.0') : 'Transferred'}
      <span className="font-bold ml-1">
        {args.deposit ? yoctoToNear(args.deposit, true) : args.deposit ?? ''} Ⓝ
      </span>{' '}
      {t ? t('txn.actions.transfer.1') : 'to'}
      <Link
        href={`/address/${receiver}`}
        className="text-green-500 dark:text-green-250 font-bold hover:no-underline ml-1"
      >
        {shortenAddress(receiver)}
      </Link>
    </div>
  );
};

export default Transfer;
