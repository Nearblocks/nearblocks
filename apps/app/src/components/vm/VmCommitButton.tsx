import { useVmStore } from '@/stores/vm';

type Props = {
  className?: string;
  data: Record<string, unknown>;
  handleCommit?: () => void;
  onCommit?: () => void;
  skeleton?: JSX.Element;
};

export function VmCommitButton(props: Props) {
  const { near, CommitButton } = useVmStore();

  if (!near || !CommitButton) {
    return;
  }

  return <CommitButton near={near} {...props} />;
}
