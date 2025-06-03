import { useParams } from 'next/navigation';

import TokenInfo from '@/components/app/common/TokenInfo';
import FaRight from '@/components/app/Icons/FaRight';
import { Link } from '@/i18n/routing';
import { EventPropsInfo } from '@/utils/types';

const Withdraw = (props: EventPropsInfo) => {
  const params = useParams();
  const log = props.event.logs?.match(/^Withdraw (\d+) NEAR from ([\S]+)/);

  if (log?.length !== 3) return null;

  return (
    <div className="action flex flex-wrap items-center break-all py-0.5">
      {props?.event?.receiptId && params?.hash ? (
        <Link
          href={`/txns/${params?.hash}?tab=execution#${props?.event?.receiptId}`}
        >
          <FaRight
            className="inline-flex text-gray-400 
      text-xs"
          />
        </Link>
      ) : (
        <FaRight
          className="inline-flex text-gray-400 
      text-xs"
        />
      )}
      <span className="font-bold px-1">Burn </span>
      <TokenInfo
        amount={log[1]}
        contract={props.event.contract}
        metaInfo={props?.tokenMetadata}
      />
    </div>
  );
};

export default Withdraw;
