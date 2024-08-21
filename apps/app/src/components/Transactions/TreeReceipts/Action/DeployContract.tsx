import FaCode from '@/components/Icons/FaCode';
import { shortenAddress } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';
import useTranslation from 'next-translate/useTranslation';
import TreeNode from '../TreeNode';
import Link from 'next/link';

const DeployContract = (props: TransactionActionInfo) => {
  const { receiver, action } = props;
  const { t } = useTranslation();

  return (
    <>
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
      <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
        <TreeNode node={action} path="root" />
      </div>
    </>
  );
};

export default DeployContract;
