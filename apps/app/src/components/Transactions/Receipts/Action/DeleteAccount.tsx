import { useTranslations } from 'next-intl';

import FaUser from '@/components/Icons/FaUser';
import { Link } from '@/i18n/routing';
import { shortenAddress } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';

const DeleteAccount = (props: TransactionActionInfo) => {
  const t = useTranslations();
  return (
    <div className="py-1">
      <FaUser className="inline-flex text-red-400 mr-1" />
      {t ? t('txnDetails.actions.deleteAccount.0') : 'Delete account'} (
      <Link
        className="text-green-500 dark:text-green-250 font-bold hover:no-underline"
        href={`/address/${props?.receiver}`}
      >
        {shortenAddress(props?.receiver)}
      </Link>
      ){' '}
      {t
        ? t('txnDetails.actions.deleteAccount.1')
        : 'and transfer remaining funds to'}
      <Link
        className="text-green-500 dark:text-green-250 font-bold hover:no-underline"
        href={`/address/${props?.args?.beneficiary_id}`}
      >
        {shortenAddress(props?.args?.beneficiary_id)}
      </Link>
    </div>
  );
};

export default DeleteAccount;
