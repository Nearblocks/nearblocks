import { nanoToMilli } from '@/utils/libs';

import dayjs from '@/utils/app/dayjs';
import Tooltip from '@/components/app/common/Tooltip';

const Timestamp = ({ showAge = true, timestamp, showTooltip = true }: any) => {
  const isValidTimestamp = timestamp && !isNaN(nanoToMilli(timestamp));
  if (!isValidTimestamp) return;
  if (showTooltip) {
    return (
      <Tooltip
        className="left-1/2 -ml-3 whitespace-nowrap"
        position="top"
        tooltip={
          !showAge ? (
            dayjs()
              .locale('en')
              .to(dayjs(nanoToMilli(timestamp)))
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
            ? dayjs()
                .locale('en')
                .to(dayjs(nanoToMilli(timestamp)))
            : dayjs.utc(nanoToMilli(timestamp)).format('YYYY-MM-DD HH:mm:ss')}
        </span>
      </Tooltip>
    );
  } else {
    return (
      <span suppressHydrationWarning className="whitespace-nowrap">
        {showAge
          ? dayjs()
              .locale('en')
              .to(dayjs(nanoToMilli(timestamp)))
          : dayjs.utc(nanoToMilli(timestamp)).format('YYYY-MM-DD HH:mm:ss')}
      </span>
    );
  }
};

export default Timestamp;
