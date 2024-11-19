import { env } from 'next-runtime-env';
import { type JSX, useEffect, useRef, useState } from 'react';

import { useBosLoaderStore } from '@/stores/bos-loader';
import { useVmStore } from '@/stores/vm';

type Props = {
  defaultSkelton?: JSX.Element;
  loading?: JSX.Element;
  onChangeHeight?: () => void;
  props?: Record<string, unknown>;
  skeleton?: JSX.Element;
  src: string;
};

export function VmComponent(props: Props) {
  const { defaultSkelton, onChangeHeight, skeleton } = props;
  const onChangeHeightCalled = useRef(false);

  const { ethersContext, EthersProvider, Widget } = useVmStore();
  const redirectMapStore = useBosLoaderStore();
  const [showLoader, setShowLoader] = useState(true);
  const [Loader, setLoader] = useState(true);
  useEffect(() => {
    setLoader(!EthersProvider || !redirectMapStore.hasResolved);
    const timer = setTimeout(() => {
      setShowLoader(!EthersProvider || !redirectMapStore.hasResolved);
    }, 350);

    return () => clearTimeout(timer);
  }, [EthersProvider, redirectMapStore.hasResolved]);
  useEffect(() => {
    if (!showLoader && !onChangeHeightCalled.current) {
      onChangeHeight && onChangeHeight();
      onChangeHeightCalled.current = true;
    }
  }, [showLoader, onChangeHeight]);
  const ownerId = env('NEXT_PUBLIC_ACCOUNT_ID');
  return (
    <>
      {showLoader && skeleton}
      {Loader ? (
        defaultSkelton
      ) : (
        <EthersProvider value={ethersContext}>
          <Widget
            config={{
              redirectMap: redirectMapStore.redirectMap,
            }}
            {...props}
            props={{ ownerId: ownerId, ...props.props }}
          />
        </EthersProvider>
      )}
    </>
  );
}
