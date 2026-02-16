import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export const ToggleGroup = ({ children, className }: Props) => {
  return (
    <div
      className={cn(
        'border-border grid auto-cols-fr grid-flow-col divide-x! rounded-lg border [&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg',
        className,
      )}
    >
      {children}
    </div>
  );
};
