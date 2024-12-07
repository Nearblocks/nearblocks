import { useTranslations } from 'next-intl';

import FaKey from '@/components/app/Icons/FaKey';
import { shortenHex } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';

import TreeNode from '../TreeNode';

const DeleteKey = (props: TransactionActionInfo) => {
  const { action, args } = props;
  const t = useTranslations();

  return (
    <>
      <div className="py-1">
        <FaKey className="inline-flex text-red-400 mr-1" />{' '}
        {t ? t('txnDetails.actions.deleteKey.0') : 'Key'} (
        <span className="font-bold">{shortenHex(args.public_key)}</span>){' '}
        {t ? t('txnDetails.actions.deleteKey.1') : 'deleted'}
      </div>
      <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
        <TreeNode node={action} path="root" />
      </div>
    </>
  );
};

export default DeleteKey;
