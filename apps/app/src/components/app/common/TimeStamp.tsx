import { nanoToMilli } from '@/utils/libs';

import dayjs from '../../../utils/app/dayjs';
import Tooltip from './Tooltip';

const TimeStamp = ({ showAge = true, timestamp }: any) => {
  const isValidTimestamp = timestamp && !isNaN(nanoToMilli(timestamp));
  if (!isValidTimestamp) return;
  return (
    <Tooltip
      className="left-1/2 -ml-3 whitespace-nowrap"
      position="top"
      tooltip={
        !showAge ? (
          dayjs().to(dayjs(nanoToMilli(timestamp)))
        ) : (
          <span className="whitespace-nowrap">
            {dayjs
              .utc(nanoToMilli(timestamp || 0))
              .format('YYYY-MM-DD HH:mm:ss')}
          </span>
        )
      }
    >
      <span suppressHydrationWarning className="whitespace-nowrap">
        {showAge
          ? dayjs().to(dayjs(nanoToMilli(timestamp)))
          : dayjs.utc(nanoToMilli(timestamp)).format('YYYY-MM-DD HH:mm:ss')}
      </span>
    </Tooltip>
  );
};

export default TimeStamp;
