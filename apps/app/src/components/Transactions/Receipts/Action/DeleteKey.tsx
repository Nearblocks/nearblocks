import { useTranslations } from 'next-intl';

import FaKey from '@/components/Icons/FaKey';
import { shortenHex } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';

const DeleteKey = (props: TransactionActionInfo) => {
  const t = useTranslations();
  const { args } = props;

  return (
    <div className="py-1">
      <FaKey className="inline-flex text-red-400 mr-1" />{' '}
      {t ? t('txn.actions.deleteKey.0') : 'Key'} (
      <span className="font-bold">{shortenHex(args?.public_key)}</span>){' '}
      {t ? t('txn.actions.deleteKey.1') : 'deleted'}
    </div>
  );
};

export default DeleteKey;
