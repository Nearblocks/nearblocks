import { useBosLoaderStore } from '@/stores/bos-loader';
import { useVmStore } from '@/stores/vm';

type Props = {
  src: string;
  props?: Record<string, unknown>;
  spinner?: JSX.Element;
};

export function VmComponent(props: Props) {
  const { EthersProvider, Widget } = useVmStore();
  const redirectMapStore = useBosLoaderStore();

  if (!EthersProvider || !redirectMapStore.hasResolved) {
    return props.spinner;
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
