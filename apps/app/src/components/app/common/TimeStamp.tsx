import { Tooltip } from '@reach/tooltip';

import { nanoToMilli } from '@/utils/libs';

import dayjs from '../../../utils/app/dayjs';

const TimeStamp = ({ showAge = true, timestamp }: any) => {
  return (
    <Tooltip
      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
      label={
        !showAge
          ? dayjs().to(dayjs(nanoToMilli(timestamp || 0)))
          : dayjs.utc(nanoToMilli(timestamp || 0)).format('YYYY-MM-DD HH:mm:ss')
      }
    >
      <span suppressHydrationWarning>
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
