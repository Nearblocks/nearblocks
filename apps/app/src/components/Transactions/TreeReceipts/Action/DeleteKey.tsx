import FaKey from '@/components/Icons/FaKey';
import TreeNode from '../TreeNode';
import { TransactionActionInfo } from '@/utils/types';
import { shortenHex } from '@/utils/libs';
import { useTranslations } from 'next-intl';

const DeleteKey = (props: TransactionActionInfo) => {
  const { args, action } = props;
  const t = useTranslations();

  return (
    <>
      <div className="py-1">
        <FaKey className="inline-flex text-red-400 mr-1" />{' '}
        {t ? t('txn.actions.deleteKey.0') : 'Key'} (
        <span className="font-bold">{shortenHex(args?.public_key)}</span>){' '}
        {t ? t('txn.actions.deleteKey.1') : 'deleted'}
      </div>
      <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
        <TreeNode node={action} path="root" />
      </div>
    </>
  );
};

export default DeleteKey;
