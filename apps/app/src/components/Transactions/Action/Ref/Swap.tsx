import TokenInfo from '@/components/common/TokenInfo';
import FaRight from '@/components/Icons/FaRight';
import { EventPropsInfo } from '@/utils/types';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Swap = (props: EventPropsInfo) => {
  const router = useRouter();
  const { hash } = router.query;

  const log = props.event.logs?.match(
    /^Swapped (\d+) ([\S]+) for (\d+) ([\S]+)/,
  );
  if (!Array.isArray(log)) {
    return null;
  }

  if (log?.length === 0) return null;

  return (
    <div className="action flex flex-wrap items-center break-all leading-7">
      {props?.event?.receiptId && hash ? (
        <Link
          href={`/txns/${hash}#execution#${props.event?.receiptId}`}
          className="cursor-pointer"
        >
          <FaRight className="inline-flex text-gray-400 text-xs" />
        </Link>
      ) : (
        <FaRight className="inline-flex text-gray-400 text-xs" />
      )}
      <span className="font-bold px-1">Swap </span>
      <TokenInfo contract={log[2]} amount={log[1]} />
      <TokenInfo contract={log[4].replace(/,$/, '')} amount={log[3]} />
      <span className="font-bold text-gray px-1">
        On{' '}
        <Link
          href="/address/v2.ref-finance.near"
          className="text-green-500 dark:text-green-250 font-normal hover:no-underline"
        >
          Ref Finance
        </Link>
      </span>
    </div>
  );
};

export default Swap;
