import { useTranslations } from 'next-intl';

import FaUser from '@/components/Icons/FaUser';
import { Link } from '@/i18n/routing';
import { shortenAddress } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';

import TreeNode from '../TreeNode';

const CreateAccount = (props: TransactionActionInfo) => {
  const { action } = props;
  const t = useTranslations();

  return (
    <>
      <div className="py-1">
        <FaUser className="inline-flex text-emerald-400 mr-1" />{' '}
        {t ? t('txn.actions.createAccount.0') : 'New account'} (
        <Link
          className="text-green-500 dark:text-green-250 font-bold hover:no-underline"
          href={`/address/${props?.receiver}`}
        >
          {shortenAddress(props?.receiver)}
        </Link>
        ) {t ? t('txn.actions.createAccount.1') : 'created'}
      </div>
      <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
        <TreeNode node={action} path="root" />
      </div>
    </>
  );
};

export default CreateAccount;
