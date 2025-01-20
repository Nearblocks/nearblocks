import FaRight from '@/components/Icons/FaRight';
import { shortenAddress } from '@/utils/libs';
import { ActionPropsInfo } from '@/utils/types';
import Link from 'next/link';
import { useRouter } from 'next/router';

const DeleteAccount = (props: ActionPropsInfo) => {
  const router = useRouter();
  const { hash } = router.query;

  return (
    <div className="action flex flex-wrap items-center break-all">
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

      <span className="font-bold pl-1">
        Delete Account{' '}
        <Link
          href={`/address/${props.action.to}`}
          className="text-green-500 dark:text-green-250 font-normal pl-1"
        >
          {shortenAddress(props.action.to)}
        </Link>
      </span>
    </div>
  );
};

export default DeleteAccount;
