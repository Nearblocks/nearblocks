import FaUser from '@/components/Icons/FaUser';
import { shortenAddress } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';
import useTranslation from 'next-translate/useTranslation';
import TreeNode from '../TreeNode';
import Link from 'next/link';

const CreateAccount = (props: TransactionActionInfo) => {
  const { action } = props;
  const { t } = useTranslation();

  return (
    <>
      <div className="py-1">
        <FaUser className="inline-flex text-emerald-400 mr-1" />{' '}
        {t ? t('txns:txn.actions.createAccount.0') : 'New account'} (
        <Link
          href={`/address/${props.receiver}`}
          className="text-green-500 dark:text-green-250 font-bold hover:no-underline"
        >
          {shortenAddress(props.receiver)}
        </Link>
        ) {t ? t('txns:txn.actions.createAccount.1') : 'created'}
      </div>
      <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
        <TreeNode node={action} path="root" />
      </div>
    </>
  );
};

export default CreateAccount;
