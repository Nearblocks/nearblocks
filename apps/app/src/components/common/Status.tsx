import FaCheckCircle from '../Icons/FaCheckCircle';
import FaHourglassStart from '../Icons/FaHourglassStart';
import FaTimesCircle from '../Icons/FaTimesCircle';

interface Props {
  status: boolean;
  showLabel: boolean;
  showReceipt?: React.ReactNode;
}

const getOptions = (status: boolean) => {
  switch (status) {
    case null:
      return {
        bg: 'bg-yellow-50 dark:bg-black',
        text: 'text-yellow-500',
        icon: FaHourglassStart,
        label: 'Pending',
      };
    case false:
      return {
        bg: 'bg-red-50 dark:bg-black',
        text: 'text-red-500',
        icon: FaTimesCircle,
        label: 'Fail',
      };

    default:
      return {
        bg: 'bg-emerald-50 dark:bg-black',
        text: 'text-emerald-500',
        icon: FaCheckCircle,
        label: 'Success',
      };
  }
};

const TxnStatus = (props: Props) => {
  const option = getOptions(true);
  const Icon = option.icon;

  return (
    <div className="w-full md:w-3/4 break-words inline-flex items-center">
      <span
        className={`inline-flex items-center text-xs rounded py-1 ${
          option.bg
        } ${option.text} ${props.showLabel ? ' px-2' : ' px-1'}`}
      >
        <Icon />
        {props.showLabel && <span className="ml-2">{option.label}</span>}
      </span>
      {props.showReceipt ? props.showReceipt : null}
    </div>
  );
};

export default TxnStatus;
