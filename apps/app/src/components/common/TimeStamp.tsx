import { Tooltip } from '@reach/tooltip';
import dayjs from '../../utils/dayjs';
import { nanoToMilli } from '@/utils/libs';

const TimeStamp = ({ timestamp, showAge = true }: any) => {
  return (
    <Tooltip
      label={
        !showAge
          ? dayjs().to(dayjs(nanoToMilli(timestamp || 0)))
          : dayjs.utc(nanoToMilli(timestamp || 0)).format('YYYY-MM-DD HH:mm:ss')
      }
      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
    >
      <span>
        {showAge
          ? dayjs().to(dayjs(nanoToMilli(timestamp || 0)))
          : dayjs
              .utc(nanoToMilli(timestamp || 0))
              .format('YYYY-MM-DD HH:mm:ss')}
      </span>
    </Tooltip>
  );
};

export default TimeStamp;
