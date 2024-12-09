import { nanoToMilli } from '@/utils/libs';

import dayjs from '../../../utils/app/dayjs';
import Tooltip from './Tooltip';

const TimeStamp = ({ showAge = true, timestamp }: any) => {
  return (
    <Tooltip
      className="left-1/2 whitespace-nowrap max-w-[200px]"
      position="top"
      tooltip={
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
