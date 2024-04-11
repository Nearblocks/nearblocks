import FaKey from '@/includes/icons/FaKey';
import { TransactionActionInfo } from '@/includes/types';

const DeleteKey = (props: TransactionActionInfo) => {
  const { shortenHex } = VM.require(
    `${props.ownerId}/widget/includes.Utils.formats`,
  );

  const { t, args } = props;

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
