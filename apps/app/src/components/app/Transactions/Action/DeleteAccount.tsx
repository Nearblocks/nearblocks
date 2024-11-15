import { useParams } from 'next/navigation';

import FaRight from '@/components/Icons/FaRight';
import { Link } from '@/i18n/routing';
import { shortenAddress } from '@/utils/libs';
import { ActionPropsInfo } from '@/utils/types';

const DeleteAccount = (props: ActionPropsInfo) => {
  const params = useParams();
  return (
    <div className="action flex flex-wrap items-center break-all leading-7">
      {props?.action?.receiptId && params?.hash ? (
        <Link
          href={`/txns/${params?.hash}?tab=execution#${props?.action?.receiptId}`}
        >
          <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
        </Link>
      ) : (
        <FaRight className="inline-flex text-gray-400 dark:text-neargray-10 text-xs" />
      )}

      <span className="font-bold px-1">
        Delete Account{' '}
        <Link
          className="text-green-500 dark:text-green-250 font-normal pl-1"
          href={`/address/${props.action.to}`}
        >
          {shortenAddress(props.action.to)}
        </Link>
      </span>
    </div>
  );
};

export default DeleteAccount;
