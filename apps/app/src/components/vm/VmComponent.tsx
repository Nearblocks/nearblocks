import { useBosLoaderStore } from '@/stores/bos-loader';
import { useVmStore } from '@/stores/vm';
import { useEffect, useState } from 'react';

type Props = {
  src: string;
  props?: Record<string, unknown>;
  skeleton?: JSX.Element;
};

export function VmComponent(props: Props) {
  const { EthersProvider, Widget } = useVmStore();
  const redirectMapStore = useBosLoaderStore();
  const [showLoader, setShowLoader] = useState(
    !EthersProvider || !redirectMapStore.hasResolved,
  );
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(!EthersProvider || !redirectMapStore.hasResolved);
    }, 100);

    return () => clearTimeout(timer);
  }, [EthersProvider, redirectMapStore.hasResolved]);

  return (
    <>
      {showLoader && props.skeleton}
      {!EthersProvider || !redirectMapStore.hasResolved ? null : (
        <Widget
          config={{
            redirectMap: redirectMapStore.redirectMap,
          }}
          {...props}
        />
      )}
    </>
  );
}
