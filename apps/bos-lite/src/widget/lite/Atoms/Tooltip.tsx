import type { ReactNode } from 'react';

export type TooltipProps = {
  children: ReactNode;
  tooltip: ReactNode;
};

const Tooltip = ({ children, tooltip }: TooltipProps) => {
  return (
    <span className="relative group">
      <span className="absolute z-50 left-1/2 -translate-x-1/2 max-w-[200px] bg-bg-tooltip text-text-tooltip text-xs break-words rounded-lg p-2 transistion-[opacity] transition-[bottom] invisible bottom-[80%] opacity-0 group-hover:visible group-hover:bottom-[100%] group-hover:opacity-100">
        {tooltip}
      </span>
      <span className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-transparent border-t-bg-tooltip border-4 border-b-0 transistion-[opacity] transition-[top] invisible top-[20%] opacity-0 group-hover:visible group-hover:-top-[0%] group-hover:opacity-100" />
      <span>{children}</span>
    </span>
  );
};

export default Tooltip;
