import FaUser from '@/components/Icons/FaUser';
import { Link } from '@/i18n/routing';
import { shortenAddress } from '@/utils/libs';
import { useTranslations } from 'next-intl';

const CreateAccount = (props: any) => {
  const t = useTranslations();
  return (
    <div className="py-1">
      <FaUser className="inline-flex text-emerald-400 mr-1" />{' '}
      {t ? t('txn.actions.createAccount.0') : 'New account'} (
      <Link
        href={`/address/${props?.receiver}`}
        className="text-green-500 dark:text-green-250 font-bold hover:no-underline"
      >
        {shortenAddress(props?.receiver)}
      </Link>
      ) {t ? t('txn.actions.createAccount.1') : 'created'}
    </div>
  );
};

export default CreateAccount;
