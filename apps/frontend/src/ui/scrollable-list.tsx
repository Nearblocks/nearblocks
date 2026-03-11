'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/ui/scroll-area';

const ScrollableList = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof ScrollArea>) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<Element | null>(null);
  const [isScrollable, setIsScrollable] = React.useState(false);
  const [atBottom, setAtBottom] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const scrollable = vp.scrollHeight > vp.clientHeight + 2;
    setIsScrollable(scrollable);
    setAtBottom(
      !scrollable || vp.scrollTop + vp.clientHeight >= vp.scrollHeight - 2,
    );
  }, []);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const vp = container.querySelector('[data-slot="scroll-area-viewport"]');
    if (!vp) return;
    viewportRef.current = vp;

    checkScroll();
    vp.addEventListener('scroll', checkScroll);

    const observer = new ResizeObserver(checkScroll);
    observer.observe(vp);
    // Also observe the inner content so we catch dynamic content changes
    if (vp.firstElementChild) observer.observe(vp.firstElementChild);

    return () => {
      vp.removeEventListener('scroll', checkScroll);
      observer.disconnect();
    };
  }, [checkScroll]);

  const scrollToBottom = () => {
    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const scrollToTop = () => {
    viewportRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={containerRef}>
      <ScrollArea className={cn(className)} {...props}>
        {children}
      </ScrollArea>
      {isScrollable && (
        <button
          className="text-muted-foreground hover:text-foreground w-full cursor-pointer pt-1 text-center text-xs transition-colors"
          onClick={atBottom ? scrollToTop : scrollToBottom}
          type="button"
        >
          {atBottom ? '↑ Scroll to top' : 'Scroll for more ↓'}
        </button>
      )}
    </div>
  );
};

export { ScrollableList };
