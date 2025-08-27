import FaCode from '@/components/app/Icons/FaCode';
import { shortenAddress } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';
import { Link } from '@/i18n/routing';
import FaMinimize from '@/components/app/Icons/FaMinimize';
import FaExpand from '@/components/app/Icons/FaExpand';
import { useState } from 'react';
import { displayGlobalContractArgs } from '@/utils/app/near';

const DeployGlobalContract = (props: TransactionActionInfo) => {
  const { receiver, args } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  const displayData = displayGlobalContractArgs(args);

  return (
    <>
      <div className="pt-1">
        <FaCode className="inline-flex text-emerald-400 mr-1" />{' '}
        {'Deploy Global Contract'} (
        <Link
          className="text-green-500 dark:text-green-250 font-bold hover:no-underline"
          href={`/address/${receiver}`}
        >
          {shortenAddress(receiver)}
        </Link>
        ) {'deployed'}
      </div>

      <div className="relative w-full">
        <div className="absolute top-2 sm:!mr-4 right-2 flex">
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="bg-gray-700 dark:bg-gray-500 bg-opacity-10 hover:bg-opacity-100 group rounded-full p-1.5 w-7 h-7"
          >
            {!isExpanded ? (
              <FaMinimize className="fill-current -z-50 text-gray-700 dark:text-neargray-10 group-hover:text-white h-4 w-4" />
            ) : (
              <FaExpand className="fill-current -z-50 text-gray-700 dark:text-neargray-10 group-hover:text-white h-4 w-4" />
            )}
          </button>
        </div>
        <div
          className={`block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 p-3 resize-y font-space-mono whitespace-pre-wrap overflow-auto max-w-full overflow-x-auto ${
            !isExpanded ? 'h-[8rem]' : ''
          }`}
        >
          {displayData}
        </div>
      </div>
    </>
  );
};

export default DeployGlobalContract;
