import FaCheckCircle from '@/components/app/Icons/FaCheckCircle';
import FaHourglassStart from '@/components/app/Icons/FaHourglassStart';
import FaTimesCircle from '@/components/app/Icons/FaTimesCircle';

interface Props {
  status: 'SuccessValue' | 'Failure' | 'SuccessReceiptId' | 'Unknown';
  showLabel: boolean;
  showReceipt?: React.ReactNode;
}

const getOptions = (status: Props['status']) => {
  switch (status) {
    case 'Unknown':
      return {
        bg: 'bg-yellow-50 dark:bg-black',
        text: 'text-yellow-500',
        icon: FaHourglassStart,
        label: 'Pending',
      };
    case 'Failure':
      return {
        bg: 'bg-red-50 dark:bg-black',
        text: 'text-red-500',
        icon: FaTimesCircle,
        label: 'Fail',
      };
    case 'SuccessValue':
      return {
        bg: 'bg-emerald-50 dark:bg-black',
        text: 'text-emerald-500',
        icon: FaCheckCircle,
        label: 'Success',
      };
    case 'SuccessReceiptId':
      return {
        bg: 'bg-emerald-50 dark:bg-black',
        text: 'text-emerald-500',
        icon: FaCheckCircle,
        label: 'Success',
      };
  }
};

const RpcTxnStatus = (props: any) => {
  if (!props.status) {
    return null;
  }

  const statusType = Object.keys(props.status)[0] as Props['status'];
  const option = getOptions(statusType);
  const Icon = option?.icon;

  return (
    <div className=" inline-flex items-center">
      <span
        className={`inline-flex items-center text-xs rounded py-1 ${option?.bg} ${option?.text} ${
          props.showLabel ? ' px-2' : ' px-1'
        }`}
      >
        <Icon />
        {props.showLabel && <span className="ml-2">{option?.label}</span>}
      </span>
      {props.showReceipt ? props.showReceipt : null}
    </div>
  );
};
export default RpcTxnStatus;
