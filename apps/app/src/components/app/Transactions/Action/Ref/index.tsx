import { EventPropsInfo } from '@/utils/types';

import Swap from '@/components/app/Transactions/Action/Ref/Swap';

const RefContract = (props: EventPropsInfo) => {
  return <Swap event={props.event} />;
};

export default RefContract;
