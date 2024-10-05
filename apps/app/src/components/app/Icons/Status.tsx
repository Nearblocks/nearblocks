import FaCheckCircle from './FaCheckCircle';
import FaHourglassStart from './FaHourglassStart';
import FaTimesCircle from './FaTimesCircle';

interface Props {
  status: boolean;
  showLabel: boolean;
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
        label: 'Failure',
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
  const option = getOptions(props.status);
  const Icon = option.icon;

  return (
    <div className="w-full md:w-3/4 break-words">
      <span
        className={`inline-flex items-center text-xs rounded py-1 ${
          option.bg
        } ${option.text} ${props.showLabel ? ' px-2' : ' px-1'}`}
      >
        <Icon />
        {props.showLabel && <span className="ml-2">{option.label}</span>}
      </span>
    </div>
  );
};

export default TxnStatus;
