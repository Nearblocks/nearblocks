import { useBosLoaderStore } from '@/stores/bos-loader';
import { useVmStore } from '@/stores/vm';

type Props = {
  src: string;
  props?: Record<string, unknown>;
  skeleton?: JSX.Element;
};

export function VmComponent(props: Props) {
  const { EthersProvider, Widget } = useVmStore();
  const redirectMapStore = useBosLoaderStore();

  if (!EthersProvider || !redirectMapStore.hasResolved) {
    return props.skeleton || null;
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
