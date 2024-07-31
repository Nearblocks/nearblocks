import FaCode from '@/includes/icons/FaCode';
import { TransactionActionInfo } from '@/includes/types';

const DeployContract = (props: TransactionActionInfo) => {
  const { shortenAddress } = VM.require(
    `${props.ownerId}/widget/includes.Utils.libs`,
  );
  const { t, receiver } = props;

  return (
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
  );
};

export default DeployContract;
