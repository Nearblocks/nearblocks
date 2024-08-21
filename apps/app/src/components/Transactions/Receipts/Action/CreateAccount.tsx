import FaUser from '@/components/Icons/FaUser';
import { shortenAddress } from '@/utils/libs';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';

const CreateAccount = (props: any) => {
  const { t } = useTranslation();
  return (
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
  );
};

export default CreateAccount;
