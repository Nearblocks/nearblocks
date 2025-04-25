import FaCheckCircle from '../Icons/FaCheckCircle';
import FaHourglassStart from '../Icons/FaHourglassStart';
import FaTimesCircle from '../Icons/FaTimesCircle';

interface Props {
  showLabel: boolean;
  showReceipt?: React.ReactNode;
  status: boolean;
}

const getOptions = (status: boolean) => {
  switch (status) {
    case null:
      return {
        bg: 'bg-yellow-50 dark:bg-black',
        icon: FaHourglassStart,
        label: 'Pending',
        text: 'text-yellow-500',
      };
    case false:
      return {
        bg: 'bg-red-50 dark:bg-black',
        icon: FaTimesCircle,
        label: 'Fail',
        text: 'text-red-500',
      };

    default:
      return {
        bg: 'bg-emerald-50 dark:bg-black',
        icon: FaCheckCircle,
        label: 'Success',
        text: 'text-emerald-500',
      };
  }
};

const TxnStatus = (props: Props) => {
  const option = getOptions(props?.status);
  const Icon = option?.icon;

  return (
    <div className="inline-flex items-center">
      <span
        className={`inline-flex items-center text-xs rounded py-1 ${option?.bg} ${option?.text} ${
          props?.showLabel ? ' px-2' : ' px-1'
        }`}
      >
        <Icon />
        {props?.showLabel && <span className="ml-2">{option?.label}</span>}
      </span>
      {props?.showReceipt ? props?.showReceipt : null}
    </div>
  );
};

export default TxnStatus;
