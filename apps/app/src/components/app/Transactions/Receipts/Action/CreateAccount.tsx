import { useTranslations } from 'next-intl';

import FaUser from '@/components/app/Icons/FaUser';
import { Link } from '@/i18n/routing';
import { shortenAddress } from '@/utils/libs';

const CreateAccount = (props: any) => {
  const t = useTranslations();
  return (
    <div className="py-1">
      <FaUser className="inline-flex text-emerald-400 mr-1" />{' '}
      {t ? t('txnDetails.actions.createAccount.0') : 'New account'} (
      <Link
        className="text-green-500 dark:text-green-250 font-bold hover:no-underline"
        href={`/address/${props.receiver}`}
      >
        {shortenAddress(props.receiver)}
      </Link>
      ) {t ? t('txnDetails.actions.createAccount.1') : 'created'}
    </div>
  );
};

export default CreateAccount;
