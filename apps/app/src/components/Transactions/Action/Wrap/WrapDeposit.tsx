import TokenInfo from '@/components/common/TokenInfo';
import FaRight from '@/components/Icons/FaRight';
import { EventPropsInfo } from '@/utils/types';
import Link from 'next/link';
import { useRouter } from 'next/router';

const WrapDeposit = (props: EventPropsInfo) => {
  const router = useRouter();
  const { hash } = router.query;

  const log = props.event.logs?.match(/^Deposit (\d+) NEAR to ([\S]+)/);

  if (log?.length !== 3) return null;

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
      <span className="font-bold px-1">Mint </span>

      <TokenInfo contract={props.event.contract} amount={log[1]} />
    </div>
  );
};

export default WrapDeposit;
