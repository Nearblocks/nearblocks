import FaKey from '@/components/Icons/FaKey';
import { shortenHex } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';
import useTranslation from 'next-translate/useTranslation';

const DeleteKey = (props: TransactionActionInfo) => {
  const { t } = useTranslation();
  const { args } = props;

  return (
    <div className="py-1">
      <FaKey className="inline-flex text-red-400 mr-1" />{' '}
      {t ? t('txns:txn.actions.deleteKey.0') : 'Key'} (
      <span className="font-bold">{shortenHex(args.public_key)}</span>){' '}
      {t ? t('txns:txn.actions.deleteKey.1') : 'deleted'}
    </div>
  );
};

export default DeleteKey;
