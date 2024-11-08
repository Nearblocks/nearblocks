import TokenInfo from '@/components/common/TokenInfo';
import FaRight from '@/components/Icons/FaRight';
import { EventPropsInfo } from '@/utils/types';
import { useRouter } from 'next/router';

const Withdraw = (props: EventPropsInfo) => {
  const router = useRouter();
  const { hash } = router.query;

  const handleClick = () => {
    router.push(`/txns/${hash}#execution#${props.event?.receiptId}`);
  };

  const log = props.event.logs?.match(/^Withdraw (\d+) NEAR from ([\S]+)/);

  if (log?.length !== 3) return null;

  return (
    <div className="action flex flex-wrap items-center break-all leading-7">
      {props?.event?.receiptId && hash ? (
        <span onClick={handleClick} className="cursor-pointer">
          <FaRight
            className="inline-flex text-gray-400 
      text-xs"
          />
        </span>
      ) : (
        <FaRight
          className="inline-flex text-gray-400 
      text-xs"
        />
      )}

      <span className="font-bold px-1">Burn </span>
      <TokenInfo contract={props.event.contract} amount={log[1]} />
    </div>
  );
};

export default Withdraw;
2;
