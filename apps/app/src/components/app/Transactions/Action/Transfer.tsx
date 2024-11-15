import { useParams } from 'next/navigation';

import FaRight from '@/components/Icons/FaRight';
import { Link } from '@/i18n/routing';
import { shortenAddress, yoctoToNear } from '@/utils/libs';
import { ActionPropsInfo } from '@/utils/types';

const Transfer = (props: ActionPropsInfo) => {
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
        Transfer{' '}
        <span className="font-normal pl-1">
          {yoctoToNear(props.action.args.deposit, true)} Ⓝ
        </span>
      </span>
      <span className="font-bold text-gray px-1">
        From{' '}
        <Link
          className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
          href={`/address/${props.action.from}`}
        >
          {shortenAddress(props.action.from)}
        </Link>
      </span>
      <span className="font-bold text-gray px-1">
        To{' '}
        <Link
          className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
          href={`/address/${props.action.to}`}
        >
          {shortenAddress(props.action.to)}
        </Link>
      </span>
    </div>
  );
};

export default Transfer;
