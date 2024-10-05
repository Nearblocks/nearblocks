import FaUser from '@/components/Icons/FaUser';
import { shortenAddress } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';
import TreeNode from '../TreeNode';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const DeleteAccount = (props: TransactionActionInfo) => {
  const { action } = props;
  const t = useTranslations();

  return (
    <>
      <div className="py-1">
        <FaUser className="inline-flex text-red-400 mr-1" />
        {t ? t('txn.actions.deleteAccount.0') : 'Delete account'} (
        <Link
          href={`/address/${props.receiver}`}
          className="text-green-500 dark:text-green-250 font-bold hover:no-underline"
        >
          {shortenAddress(props.receiver)}
        </Link>
        ){' '}
        {t
          ? t('txn.actions.deleteAccount.1')
          : 'and transfer remaining funds to'}
        <Link
          href={`/address/${props.args.beneficiary_id}`}
          className="text-green-500 dark:text-green-250 font-bold hover:no-underline"
        >
          {shortenAddress(props.args.beneficiary_id)}
        </Link>
      </div>

      <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
        <TreeNode node={action} path="root" />
      </div>
    </>
  );
};

export default DeleteAccount;
