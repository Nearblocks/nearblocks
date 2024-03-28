import Swap from '@/includes/Common/Action/Ref/Swap';
import { EventPropsInfo } from '@/includes/types';

const RefContract = (props: EventPropsInfo) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (props.event.logs) {
      const action = /^Swapped.*/.test(props.event.logs);
      if (action) setShow(true);
    }
  }, [props]);

  return (
    <>
      {show && (
        <Swap
          event={props.event}
          network={props.network}
          ownerId={props.ownerId}
        />
      )}
    </>
  );
};

export default RefContract;
