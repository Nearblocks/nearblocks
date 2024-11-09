import { useTranslations } from 'next-intl';

import FaCode from '@/components/Icons/FaCode';
import { Link } from '@/i18n/routing';
import { shortenAddress } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';

const DeployContract = (props: TransactionActionInfo) => {
  const t = useTranslations();
  const { receiver } = props;

  return (
    <div className="py-1">
      <FaCode className="inline-flex text-emerald-400 mr-1" />{' '}
      {t ? t('txn.actions.deployContract.0') : 'Contract'} (
      <Link
        className="text-green-500 dark:text-green-250 font-bold hover:no-underline"
        href={`/address/${receiver}`}
      >
        {shortenAddress(receiver)}
      </Link>
      ) {t ? t('txn.actions.deployContract.1') : 'deployed'}
    </div>
  );
};

export default DeployContract;
