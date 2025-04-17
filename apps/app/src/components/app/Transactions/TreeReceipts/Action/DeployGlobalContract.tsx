import FaCode from '@/components/app/Icons/FaCode';
import { shortenAddress } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';
import { Link } from '@/i18n/routing';
import TreeNode from '../TreeNode';

const DeployGlobalContract = (props: TransactionActionInfo) => {
  const { action, receiver } = props;

  return (
    <>
      <div className="py-1">
        <FaCode className="inline-flex text-emerald-400 mr-1" />{' '}
        {'Deploy Global Contract'} (
        <Link
          className="text-green-500 dark:text-green-250 font-bold hover:no-underline"
          href={`/address/${receiver}`}
        >
          {shortenAddress(receiver)}
        </Link>
        ) {'invoked'}
      </div>
      <div className="mt-3 bg-gray-100 dark:bg-black-200 overflow-auto py-3 rounded-lg">
        <TreeNode node={action} path="root" />
      </div>
    </>
  );
};

export default DeployGlobalContract;
