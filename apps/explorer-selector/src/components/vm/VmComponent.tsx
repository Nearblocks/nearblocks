import { useBosLoaderStore } from '@/stores/bos-loader';
import { useVmStore } from '@/stores/vm';

import { Spinner } from '../lib/Spinner';

type Props = {
  src: string;
  props?: Record<string, unknown>;
};

export function VmComponent(props: Props) {
  const { EthersProvider, Widget } = useVmStore();
  const redirectMapStore = useBosLoaderStore();

  if (!EthersProvider || !redirectMapStore.hasResolved) {
    return <Spinner />;
  }

  return (
    <Widget
      config={{
        redirectMap: redirectMapStore.redirectMap,
      }}
      {...props}
    />
  );
}
