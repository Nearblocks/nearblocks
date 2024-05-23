import FaCode from '@/includes/icons/FaCode';
import { TransactionActionInfo } from '@/includes/types';

const DeployContract = (props: TransactionActionInfo) => {
  const { t, receiver, action, ownerId } = props;
  const { shortenAddress } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  return (
    <>
      <div className="py-1">
        <FaCode className="inline-flex text-emerald-400 mr-1" />{' '}
        {t ? t('txns:txn.actions.deployContract.0') : 'Contract'} (
        <a href={`/address/${receiver}`} className="hover:no-underline">
          <a className="text-green-500 dark:text-green-250 font-bold hover:no-underline">
            {shortenAddress(receiver)}
          </a>
        </a>
        ) {t ? t('txns:txn.actions.deployContract.1') : 'deployed'}
      </div>
      <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
        <Widget
          src={`${ownerId}/widget/includes.Common.TreeReceipts.TreeNode`}
          props={{
            node: action,
            path: 'root',
            ownerId,
          }}
        />
      </div>
    </>
  );
};

export default DeployContract;
