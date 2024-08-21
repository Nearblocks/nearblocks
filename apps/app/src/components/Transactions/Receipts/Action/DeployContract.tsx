import FaCode from '@/components/Icons/FaCode';
import { shortenAddress } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';

const DeployContract = (props: TransactionActionInfo) => {
  const { t } = useTranslation();
  const { receiver } = props;

  return (
    <div className="py-1">
      <FaCode className="inline-flex text-emerald-400 mr-1" />{' '}
      {t ? t('txns:txn.actions.deployContract.0') : 'Contract'} (
      <Link
        href={`/address/${receiver}`}
        className="text-green-500 dark:text-green-250 font-bold hover:no-underline"
      >
        {shortenAddress(receiver)}
      </Link>
      ) {t ? t('txns:txn.actions.deployContract.1') : 'deployed'}
    </div>
  );
};

export default DeployContract;
