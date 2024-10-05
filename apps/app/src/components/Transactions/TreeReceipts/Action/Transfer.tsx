import FaArrowAltCircleRight from '@/components/Icons/FaArrowAltCircleRight';
import { shortenAddress, yoctoToNear } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';
import TreeNode from '../TreeNode';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const Transfer = (props: TransactionActionInfo) => {
  const { args, receiver, action } = props;
  const t = useTranslations();
  return (
    <>
      <div className="py-1">
        <FaArrowAltCircleRight className="inline-flex text-green-400 mr-1" />{' '}
        {t ? t('txn.actions.transfer.0') : 'Transferred'}
        <span className="font-bold ml-1">
          {args.deposit ? yoctoToNear(args.deposit, true) : args.deposit ?? ''}{' '}
          Ⓝ
        </span>{' '}
        {t ? t('txn.actions.transfer.1') : 'to'}
        <Link
          href={`/address/${receiver}`}
          className="text-green-500 dark:text-green-250 font-bold hover:no-underline ml-1"
        >
          {shortenAddress(receiver)}
        </Link>
      </div>
      <div className="mt-3 bg-gray-100 dark:bg-black-200 p-3 overflow-auto rounded-lg">
        <TreeNode node={action} path="root" />
      </div>
    </>
  );
};

export default Transfer;
