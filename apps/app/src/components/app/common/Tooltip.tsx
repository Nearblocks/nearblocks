import type { ReactNode } from 'react';

export type TooltipProps = {
  children: ReactNode;
  className?: string;
  position?: 'bottom' | 'left' | 'top';
  tooltip: ReactNode;
};

const Tooltip = ({
  children,
  className,
  position = 'bottom',
  tooltip,
}: TooltipProps) => {
  const tooltipPositionClasses = {
    bottom: 'top-[80%] -translate-x-1/2 mt-3',
    left: 'right-[80%] -translate-y-1/2 mr-4',
    top: 'bottom-[80%] -translate-x-1/2 mb-2',
  };

  return (
    <span className="relative group">
      <span
        className={`absolute z-10 bg-black text-white text-xs max-w-min rounded-lg p-2 transition-all invisible opacity-0 group-hover:visible group-hover:opacity-80 ${tooltipPositionClasses[position]} ${className}`}
        style={{
          transitionDuration: '150ms',
        }}
      >
        {tooltip}
      </span>
      <span>{children}</span>
    </span>
  );
};

export default Tooltip;
