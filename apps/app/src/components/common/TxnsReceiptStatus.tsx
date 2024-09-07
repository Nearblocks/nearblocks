import FaCheckCircle from '../Icons/FaCheckCircle';
import FaTimesCircle from '../Icons/FaTimesCircle';

interface Props {
  status: any;
  showLabel?: boolean;
}

const getOptions = (status: boolean) => {
  switch (status) {
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

const TxnsReceiptStatus = (props: Props) => {
  const { status, showLabel } = props;

  const option = getOptions(status);
  const Icon = option.icon;

  return (
    <div className="w-full md:w-3/4 break-words flex items-center">
      <span
        className={`inline-flex items-center text-xs rounded py-1 ${
          option.bg
        } ${option.text} ${showLabel ? ' px-2' : ' px-1'}`}
      >
        <Icon />
        {showLabel && <span className="ml-2">{option.label}</span>}
      </span>
    </div>
  );
};

export default TxnsReceiptStatus;
