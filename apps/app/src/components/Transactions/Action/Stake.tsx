import FaRight from '@/components/Icons/FaRight';
import { yoctoToNear } from '@/utils/libs';
import { ActionPropsInfo } from '@/utils/types';
import { useRouter } from 'next/router';

const Stake = (props: ActionPropsInfo) => {
  const router = useRouter();
  const { hash } = router.query;
  const handleClick = () => {
    router.push(`/txns/${hash}#execution#${props.action?.receiptId}`);
  };

  return (
    <div className="action flex flex-wrap items-center break-all leading-7">
      {props?.action?.receiptId && hash ? (
        <span onClick={handleClick} className="cursor-pointer">
          <FaRight className="inline-flex text-gray-400 text-xs" />
        </span>
      ) : (
        <FaRight className="inline-flex text-gray-400 text-xs" />
      )}

      <span className="font-bold px-1">
        Stake{' '}
        <span className="font-normal pl-1">
          {yoctoToNear(props.action.args.stake, true)} Ⓝ
        </span>
      </span>
    </div>
  );
};

export default Stake;
