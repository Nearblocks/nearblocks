import { EventPropsInfo } from '@/utils/types';

import Swap from './Swap';

const RefContract = (props: EventPropsInfo) => {
  return <Swap event={props.event} tokenMetadata={props?.tokenMetadata} />;
};

export default RefContract;
