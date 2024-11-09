import { useTranslations } from 'next-intl';

import FaCode from '@/components/Icons/FaCode';
import { Link } from '@/i18n/routing';
import { shortenAddress } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';

import TreeNode from '../TreeNode';

const DeployContract = (props: TransactionActionInfo) => {
  const { action, receiver } = props;
  const t = useTranslations();

  return (
    <>
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
      <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
        <TreeNode node={action} path="root" />
      </div>
    </>
  );
};

export default DeployContract;
