import FaUser from '@/components/Icons/FaUser';
import { Link } from '@/i18n/routing';
import { shortenAddress } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';
import { useTranslations } from 'next-intl';

const DeleteAccount = (props: TransactionActionInfo) => {
  const t = useTranslations();
  return (
    <div className="py-1">
      <FaUser className="inline-flex text-red-400 mr-1" />
      {t ? t('txn.actions.deleteAccount.0') : 'Delete account'} (
      <Link
        href={`/address/${props?.receiver}`}
        className="text-green-500 dark:text-green-250 font-bold hover:no-underline"
      >
        {shortenAddress(props?.receiver)}
      </Link>
      ){' '}
      {t ? t('txn.actions.deleteAccount.1') : 'and transfer remaining funds to'}
      <Link
        href={`/address/${props?.args?.beneficiary_id}`}
        className="text-green-500 dark:text-green-250 font-bold hover:no-underline"
      >
        {shortenAddress(props?.args?.beneficiary_id)}
      </Link>
    </div>
  );
};

export default DeleteAccount;
