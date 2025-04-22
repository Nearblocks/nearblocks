import Tooltip from '../common/Tooltip';
import Question from '../Icons/Question';
import SwitchButton from '../SwitchButton';

interface ChartToggleProps {
  tooltip: string;
  selected: boolean;
  onChange: () => void;
  label: string;
}

const ChartToggle = ({
  tooltip,
  selected,
  onChange,
  label,
}: ChartToggleProps) => {
  return (
    <span className="text-nearblue-600 dark:text-neargray-10 inline-flex items-center">
      <Tooltip
        className="sm:left-1/2 left-20 max-w-[200px] w-max"
        position="bottom"
        tooltip={tooltip}
      >
        <span>
          <Question className="w-4 h-4 fill-current mr-2" />
        </span>
      </Tooltip>
      <div className="flex">
        <SwitchButton onChange={onChange} selected={selected} />
      </div>
      <label className="text-nearblue-600 dark:text-neargray-10 text-sm leading-none px-4 w-16">
        {label}
      </label>
    </span>
  );
};

export default ChartToggle;
