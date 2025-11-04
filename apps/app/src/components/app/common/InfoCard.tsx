import Tooltip from '@/components/app/common/Tooltip';
import Question from '@/components/app/Icons/Question';

const InfoCard = ({
  title,
  value,
  footerText,
  showTooltip,
}: {
  title: string;
  value: string;
  footerText: string;
  showTooltip?: string;
}) => {
  return (
    <div className="border border-slate-200 dark:border-black-200 rounded-lg p-5 flex flex-col w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider">
          {title}
        </span>
        {showTooltip && (
          <Tooltip className={'w-96 left-25 max-w-fit'} tooltip={showTooltip}>
            <div>
              <Question className="w-4 h-4 fill-current mr-1" />
            </div>
          </Tooltip>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="text-1xl font-bold dark:text-neargray-10 text-nearblue-600 leading-tight">
          {value}
        </div>
        <div className="text-sm dark:text-neargray-10 text-nearblue-600">
          {footerText}
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
