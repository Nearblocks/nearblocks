import { useBosLoaderStore } from '@/stores/bos-loader';
import { useVmStore } from '@/stores/vm';
import { useEffect, useRef, useState } from 'react';

type Props = {
  src: string;
  props?: Record<string, unknown>;
  skeleton?: JSX.Element;
  onChangeHeight?: () => void;
  defaultSkelton?: JSX.Element;
};

export function VmComponent(props: Props) {
  const { skeleton, onChangeHeight, defaultSkelton } = props;
  const onChangeHeightCalled = useRef(false);

  const { EthersProvider, Widget } = useVmStore();
  const redirectMapStore = useBosLoaderStore();
  const [showLoader, setShowLoader] = useState(true);
  const [Loader, setLoader] = useState(true);
  useEffect(() => {
    setLoader(!EthersProvider || !redirectMapStore.hasResolved);
    const timer = setTimeout(() => {
      setShowLoader(!EthersProvider || !redirectMapStore.hasResolved);
    }, 250);

    return () => clearTimeout(timer);
  }, [EthersProvider, redirectMapStore.hasResolved]);
  useEffect(() => {
    if (!showLoader && !onChangeHeightCalled.current) {
      onChangeHeight && onChangeHeight();
      onChangeHeightCalled.current = true;
    }
  }, [showLoader, onChangeHeight]);

  return (
    <>
      {showLoader && skeleton}
      {Loader ? (
        defaultSkelton
      ) : (
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
