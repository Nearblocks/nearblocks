import FaCode from '@/components/app/Icons/FaCode';
import { shortenAddress } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';
import { Link } from '@/i18n/routing';

const DeployGlobalContractByAccountId = (props: TransactionActionInfo) => {
  const { receiver } = props;

  return (
    <div className="py-1">
      <FaCode className="inline-flex text-emerald-400 mr-1" />{' '}
      {'Deploy Global Contract By AccountId'} (
      <Link
        className="text-green-500 dark:text-green-250 font-bold hover:no-underline"
        href={`/address/${receiver}`}
      >
        {shortenAddress(receiver)}
      </Link>
      ) {'deployed'}
    </div>
  );
};

export default DeployGlobalContractByAccountId;
