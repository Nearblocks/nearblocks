import { useTranslations } from 'next-intl';

import FaKey from '@/components/app/Icons/FaKey';
import { shortenHex } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';

import TreeNode from '@/components/app/Transactions/TreeReceipts/TreeNode';
import { CopyButton } from '@/components/app/common/CopyButton';
import Tooltip from '@/components/app/common/Tooltip';

const DeleteKey = (props: TransactionActionInfo) => {
  const { action, args } = props;
  const t = useTranslations();
  const publicKey = args?.public_key || args?.publicKey;

  return (
    <>
      <div className="py-1">
        <FaKey className="inline-flex text-red-400 mr-1" />{' '}
        {t ? t('txnDetails.actions.deleteKey.0') : 'Key'} (
        {publicKey && (
          <>
            <Tooltip
              tooltip={publicKey}
              position="top"
              className={
                'left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-[280px] break-all sm:max-w-none sm:break-normal sm:w-max'
              }
              showArrow
            >
              <span className="font-bold">{shortenHex(publicKey)}</span>
            </Tooltip>
            <span>
              <CopyButton textToCopy={publicKey} />
            </span>
          </>
        )}
        ) {t ? t('txnDetails.actions.deleteKey.1') : 'deleted'}
      </div>
      <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
        <TreeNode node={action} path="root" />
      </div>
    </>
  );
};

export default DeleteKey;
