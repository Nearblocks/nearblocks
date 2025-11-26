import type { ReactNode } from 'react';

export type TooltipProps = {
  children: ReactNode;
  className?: string;
  position?: 'bottom' | 'left' | 'top';
  tooltip: ReactNode;
  showArrow?: boolean;
};

const Tooltip = ({
  children,
  className,
  position = 'bottom',
  tooltip,
  showArrow = false,
}: TooltipProps) => {
  const tooltipPositionClasses = {
    bottom: 'top-[80%] -translate-x-1/2 mt-3',
    left: 'right-[80%] -translate-y-1/2 mr-4',
    top: 'bottom-[80%] -translate-x-1/2 mb-2',
  };

  const arrowPositionClasses = {
    bottom:
      'top-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-black z-20 pointer-events-none',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-black z-20 pointer-events-none',
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black z-20 pointer-events-none',
  };

  return tooltip ? (
    <span className="relative group">
      <span
        className={`absolute z-10 bg-black text-white text-xs break-words rounded-lg p-2 transition-all invisible opacity-0 group-hover:visible group-hover:opacity-80 ${tooltipPositionClasses[position]} ${className}`}
        style={{
          transitionDuration: '150ms',
        }}
      >
        {showArrow && (
          <span
            className={`absolute w-0 h-0 ${arrowPositionClasses[position]}`}
          />
        )}
        {tooltip}
      </span>
      <span>{children}</span>
    </span>
  ) : null;
};

export default Tooltip;
