import Swap from '@/includes/Common/Action/Ref/Swap';
import { EventPropsInfo } from '@/includes/types';

const RefContract = (props: EventPropsInfo) => {
  return (
    <Swap event={props.event} network={props.network} ownerId={props.ownerId} />
  );
};

export default RefContract;
