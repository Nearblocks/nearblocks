import { useParams } from 'next/navigation';

import { Link } from '@/i18n/routing';
import { ActionPropsInfo } from '@/utils/types';

import FaRight from '../../Icons/FaRight';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';

const DeployContract = (props: ActionPropsInfo) => {
  const params = useParams();

  return (
    <div className="action flex flex-wrap items-center break-all">
      {props?.action?.receiptId && params?.hash ? (
        <Link
          href={`/txns/${params?.hash}?tab=execution#${props?.action?.receiptId}`}
        >
          <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
        </Link>
      ) : (
        <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
      )}
      <span className="font-bold px-1 flex items-center">
        Deploy Contract
        <AddressOrTxnsLink
          className="h-6 flex items-center ml-1"
          currentAddress={props.action.to}
        />
      </span>
    </div>
  );
};

export default DeployContract;
