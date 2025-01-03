import FaRight from '@/components/Icons/FaRight';
import { shortenAddress, yoctoToNear } from '@/utils/libs';
import { ActionPropsInfo } from '@/utils/types';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Transfer = (props: ActionPropsInfo) => {
  const router = useRouter();
  const { hash } = router.query;

  return (
    <div className="action flex flex-wrap items-center break-all leading-7">
      {props?.action?.receiptId && hash ? (
        <Link
          href={`/txns/${hash}#execution#${props.action?.receiptId}`}
          className="cursor-pointer"
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
          href={`/address/${props.action.from}`}
          className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
        >
          {shortenAddress(props.action.from)}
        </Link>
      </span>
      <span className="font-bold text-gray px-1">
        To{' '}
        <Link
          href={`/address/${props.action.to}`}
          className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
        >
          {shortenAddress(props.action.to)}
        </Link>
      </span>
    </div>
  );
};

export default Transfer;
