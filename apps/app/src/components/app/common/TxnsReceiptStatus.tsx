import FaCheckCircle from '@/components/app/Icons/FaCheckCircle';
import FaTimesCircle from '@/components/app/Icons/FaTimesCircle';

interface Props {
  showLabel?: boolean;
  status: any;
}

const getOptions = (status: boolean) => {
  switch (status) {
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

const TxnsReceiptStatus = (props: Props) => {
  const { showLabel, status } = props;

  const option = getOptions(status);
  const Icon = option?.icon;

  return (
    <div className="w-full md:w-3/4 break-words flex items-center">
      <span
        className={`inline-flex items-center text-xs rounded py-1 ${option?.bg} ${option?.text} ${
          showLabel ? ' px-2' : ' px-1'
        }`}
      >
        <Icon />
        {showLabel && <span className="ml-2">{option?.label}</span>}
      </span>
    </div>
  );
};

export default TxnsReceiptStatus;
